chrome.alarms.onAlarm.addListener(alarmHandler);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var audio = document.createElement("audio");
audio.sources = ["sndMsg.wav"/*,"cuckoo.ogg","digital.ogg","ringing.ogg"*/];
audio.src = audio.sources[0];
audio.volume = .17;
audio.timesToPlay = 0;
//audio.duration = 2;
audio.isPlaying = false;
document.body.appendChild(audio);

var iframe = document.createElement("iframe");
iframe.src = "sandbox.html";
document.body.appendChild(iframe);

var utilsJS = document.createElement("script");
utilsJS.src = "utils.js";
document.body.appendChild(utilsJS);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

chrome.runtime.onMessage.addListener(function(message, _, sendResponse)
        {
        switch(message.command)
            {
            case "add":
                watchManagerAddWatcher({name: message.uid, period: message.period, adaptively: message.period==0});
                break;
            ///////////////////////////////////////////
            case "remove":
                watchManagerRemoveWatcher(message.uid);
                break;
            ///////////////////////////////////////////
            case "icon":
                _setIcon();
                break;
            ///////////////////////////////////////////
            case "open":
                message.list.forEach(function(item)
                        {
                        var url = message.isOpeningNews ? item.link : item.url;
                        chrome.tabs.query({url: url}, function(tabs)
                                {
                                if(!tabs.length)
                                    chrome.tabs.create({url: url}, function(tab) { if(message.isOpeningNews) recordHasNews(item.uid, false); });
                                });
                        });
                break;
            }
        });

// Ответ из sandbox.html
window.addEventListener("message", function(ev)
        {
        switch(ev.data.command)
            {
            case "calcResponse":
                var response = ev.data;
                var rec = getRecordByUID(response.uid);

                if(response.id <= rec.idLast) return;

                rec.idLast = response.id;
                rec.link = response.link;
                rec.newTitle = response.nTitle;
                rec.hasNews = true;

                //if(watchManagerGetAlarmByName(response.uid).adaptively)
                    //{
                    var dNow= Date.now();
                    if(rec.successCounter > 1)
                        rec.successAverageTime = (rec.successAverageTime*rec.successCounter + (dNow - rec.successLastTStamp)) / (rec.successCounter+1);

                    rec.successLastTStamp = dNow;
                    rec.successCounter += 1;
                    if(rec.successCounter > 5)
                        {

                        }
                    //}

                var records = _storageGetAll();
                records[getRecordIndexByUID(rec.uid)] = rec;
                _storageSaveAll(records);

                ncenterSend({title: rec.title, nTitle: rec.newTitle, link: rec.link});

                chrome.runtime.sendMessage({command: "refresh"});
                chrome.browserAction.setIcon({path: "icon38_2.png"});
                audioAdd();
                break;
                ///////////////////////////////////////////
            case "parseYT":
                var url = event.data.url;
                load(url, function(responseText)
                        {
                        iframe.contentWindow.postMessage({command:"parseYTQuery", url: url, xmlText: repairXMLText(responseText)}, "*");
                        });
                break;
            case "parseYTQueryResponse":
                chrome.runtime.sendMessage({command: "parseYTResponse", url: event.data.url, title: event.data.title});
                break;
            }
        });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//     Starting...
//setIcon();
watchManagerRunFromStorage();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function watchManagerAddWatcher(args)
    {
    if(args.name == "") return;

    var name = args.name,
        period = args.period,
        when = args.when,
        adaptively = typeof args.adaptively!='undefined' ? args.adaptively : false;

    chrome.alarms.get(name, function(alarm)
            {
            if(alarm)
                {
                if(alarm.periodInMinutes!=period && !adaptively) watchManagerRemoveWatcher(name);
                  else return;
                }

            period = period==0 ? 1 : period;
            watchManagerPush({name: name, period: period, nextTime: when ? when : Date.now()+period*60000, adaptively: adaptively});
            var params = when ? {when: when, periodInMinutes: period} : {delayInMinutes: period, periodInMinutes: period};
            chrome.alarms.create(name, params);
            }); 
    }

function watchManagerRemoveWatcher(name)
    {
    chrome.alarms.clear(name);
    var aList = watchManagerGetAll();
    aList.forEach(function(item, index)
            {
            if(item.name == name)
                aList = aList.slice(0, index).concat(aList.slice(index+1, aList.length));
            });
    watchManagerSaveAll(aList);
    }

function watchManagerGetAll() { return localStorage["alarms"] ? JSON.parse(localStorage["alarms"]) : []; }
function watchManagerSaveAll(inst) { localStorage["alarms"] = JSON.stringify(inst); }
function watchManagerPush(obj) { var aList = watchManagerGetAll(); aList.push(obj); watchManagerSaveAll(aList); }
function watchManagerGetAlarmByIndex(index) { return watchManagerGetAll()[index]; }
function watchManagerGetAlarmByName(name) { return watchManagerGetAll()[watchManagerGetAlarmIndexByName(name)]; }
function watchManagerGetAlarmIndexByName(name)
        {
        var alarms = watchManagerGetAll();
        for(var i=0; i<alarms.length; i++)
            if(alarms[i].name == name) return i;

        return -1;
        }

function watchManagerRunFromStorage()
    {
    var aList = watchManagerGetAll();
    var dNow = Date.now();
    aList.forEach(function(item, index)
            {
            var params = {name: item.name, period: item.period, adaptively: item.adaptively}
            params.when = (item.nextTime > dNow) ? item.nextTime : params.when = dNow + item.period*60000 - (dNow - item.nextTime)%(item.period*60000);

            watchManagerAddWatcher(params);
            });
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function alarmHandler(alarm)
    {
    if(!alarm.name || !alarm.name.match(/warNews_/g) || !getRecordByUID(alarm.name)) return;

    console.log("\nПроверка " + alarm.name + " (" + (getRecordByUID(alarm.name)?getRecordByUID(alarm.name).title:alarm.name) + ")");

    var aList = watchManagerGetAll();
    var aIndex = watchManagerGetAlarmIndexByName(alarm.name);
    aList[aIndex].nextTime = Date.now() + alarm.periodInMinutes*1000*60;
    watchManagerSaveAll(aList);

    contentParse(alarm.name);
    }

function contentParse(name)
    {
    var rec = getRecordByUID(name); 

    load(rec.source, function(xmlText)
            {
            xmlText = xmlText.replace(/<link/gi, "<xlink").replace(/<id/gi, "<xid").replace(/<\/id/gi, "<\/xid");
            iframe.contentWindow.postMessage({command: "calc", uid: rec.uid, xmlText: xmlText, idEvalStr: rec.idEvalStr, linkEvalStr: rec.linkEvalStr, titleEvalStr: rec.titleEvalStr}, "*");
            });
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function audioAdd()
    {
    ++audio.timesToPlay;
    if(!audio.isPlaying) audio.play();
    }

audio.onpause = function()
    {
    if(this.duration != this.currentTime) return;

    this.src = this.sources[Math.floor(Math.random()*this.sources.length)];
    this.duration = 2;

    if(--this.timesToPlay) this.play(); else this.isPlaying = false;
    }

audio.onplay = function()
    {
    this.isPlaying = true;
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function recordHasNews(uid, hasIt, lastID)
    {
    var recs = _storageGetAll();
    var index = getRecordIndexByUID(uid);
    if(recs[index].hasNews = hasIt) recs[index].idLast = lastID;

    _storageSaveAll(recs);
    setIcon();
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ncenterSend(obj)
    {
    //console.log("ncenterSend: " + JSON.stringify(obj));
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://ncenter.16mb.com/receive.php?" + escape(JSON.stringify(obj)), true);
    xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
    xhr.onreadystatechange = function(e) { if(this.readyState == 4 && this.status == 200) /*console.log("nCenter POST response:\n" + this.responseText)*/; };
    xhr.send();
    }