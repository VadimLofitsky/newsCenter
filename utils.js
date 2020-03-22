var __recordPropsList = ["uid","url","title","image","checked","isAir","watch","hasNews","updateTime","source","idEvalStr","idLast","linkEvalStr","link","titleEvalStr","newTitle","successLastTStamp","successCounter","successAverageTime"];
var __recordPropsListDefaults = ["","","","",false,false,false,false,0,"","","","","","","",0,0,0];
var __recordDefault = {}; __recordPropsList.forEach(function(item, index) { __recordDefault[item] = __recordPropsListDefaults[index]; });
var __recordTemplateForRSS = _expand(__recordDefault, {idEvalStr:"''+new Date(xmlDoc.$('item pubdate').innerHTML).getTime()", linkEvalStr:"xmlDoc.$('item xlink').innerHTML", titleEvalStr:"xmlDoc.$('item title').innerHTML"});
var __recordTemplateForLJ = _expand(__recordDefault, {idEvalStr:"''+new Date(xmlDoc.$('item pubdate').innerHTML).getTime()", linkEvalStr:"/\\S+/gi.exec(xmlDoc.$('item xlink').childNodes[0].nodeValue)[0]", titleEvalStr:"xmlDoc.$('item title').innerHTML"});
var __recordTemplateForYoutube = _expand(__recordDefault, {idEvalStr:'""+new Date(xmlDoc.$("entry published").innerHTML).getTime()', linkEvalStr:'"https://youtube.com/watch?v="+/video:(.+)/gi.exec(xmlDoc.$("entry xid").innerHTML)[1]', titleEvalStr:'xmlDoc.$("entry title").innerHTML'});
var __recordTemplateForRutracker = _expand(__recordDefault, {idEvalStr:'""+new Date(xmlDoc.$("entry>xlink[href*=\'4456483\']").parentElement.$("updated").innerHTML).getTime()', linkEvalStr:'xmlDoc.$("entry>xlink[href*=\'4456483\']").parentElement.$("xlink").attributes["href"].value', titleEvalStr:'/&lt;!\\[CDATA\\[(.*)\\]\\]&gt;/gi.exec(xmlDoc.$("entry>xlink[href*=\'4456483\']").parentElement.$("title").innerHTML)[1]'});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function _newProps(obj) { var ar=[]; for(var p in obj) if(obj.hasOwnProperty(p)) ar.push(p);  return ar; }
function _expand(what, by, check) { what=_clone(what); for(var p in by) if(by.hasOwnProperty(p)) if(!check || (check && typeof what[p]=='undefined')) what[p] = by[p]; return what; };
function _clone(obj) { var res = {}; for(var p in obj) res[p]=obj[p]; return res; }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Array.prototype.toArray = function(coll) { return Array.prototype.slice.call(coll); };
Array.prototype.cut = function(pos) { return this.slice(0, pos).concat(this.slice(pos + 1, this.length)); }
Array.prototype.newProps = function() { var ar=[]; for(var p in this) if(typeof Array.prototype[p] == 'undefined') ar.push(p);  return ar; }
Array.prototype._sortBy = Array.prototype.sortBy;
Array.prototype.sortBy = function(arg) { if(typeof arg != 'function') return this.sort(function(a,b) { return a[arg]>b[arg]; }); else return Array.prototype._sortBy(arg); }
 // для задания типа сравниваемых значений
Array.prototype.max = function(initVal) { var max = initVal, maxIndex = 0; this.forEach(function(item, index) { if(item > max) {max = item; maxIndex = index;} }); return {value: max, index: maxIndex}; };
Array.prototype.min = function(initVal) { var min = initVal, minIndex = 0; this.forEach(function(item, index) { if(item < min) {min = item; minIndex = index;} }); return {value: min, index: minIndex}; };
Array.prototype.maxProp = function(pName, initVal) { var max = initVal, maxIndex = 0; this.forEach(function(item, index) { if(item[pName] > max) {max = item[pName]; maxIndex = index;} }); return {value: max, index: maxIndex}; };
Array.prototype.minProp = function(pName, initVal) { var min = initVal, minIndex = 0; this.forEach(function(item, index) { if(item[pName] < min) {min = item[pName]; minIndex = index;} }); return {value: min, index: minIndex}; };
/*
Array.prototype.maxProps = function(pName, initVal)
        {
        var max = initVal, maxIndex = 0;
        this.forEach(function(item, index)
                {
                if(item[pName] > max)
                    {
                    max = item[pName];
                    maxIndex = index;
                    }
                });
        return this.filter(function(item, index) { return item[pName]==max; });
        };
Array.prototype.maxProps2 = function(pName, initVal)
        {
        var max = initVal, maxIndex = 0;
        this.forEach(function(item, index)
                {
                if(item[pName] > max)
                    {
                    max = item[pName];
                    maxIndex = index;
                    }
                });
        var result = [];
        this.forEach(function(item, index) { if(item[pName]==max) result.push({value:item[pName], index: index}); });
        return result;
        };
*/
Array.prototype.print = function(withIndexes) { this.forEach(function(item, index) { console.log((withIndexes?index+"...":"") + "["+item+"]"); }); };
Array.prototype.tab = function(filterProps) { console.table(this, filterProps); };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _p(n) { _storageGetAll().tab(["title", typeof n!='string' ? __recordPropsList[n] : n]); }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

NodeList.prototype.toArray = function () { return Array.prototype.slice.call(this); };
NodeList.prototype.forEach = function (func) { this.toArray().forEach(func); };
NodeList.prototype.filter = function (func) { return this.toArray().filter(func); };
NodeList.prototype.map = function (func) { return this.toArray().map(func); };

Node.prototype.$ = function (selector) {return this.querySelector(selector);};
Node.prototype.$$ = function (selector) {return this.querySelectorAll(selector);};

var $ = function(selector, context) { return document.querySelector(selector, context); };
var $$ = function(selector, context) { return document.querySelectorAll(selector, context); };

NodeList.prototype.$$ = function(selector) { return $$(selector, this); };

Node.prototype.classAdd = function(className) { this.classList.add(className); };
Node.prototype.classRemove = function(className) { this.classList.remove(className); };
Node.prototype.classToggle = function(className) { return this.classList.toggle(className); };
NodeList.prototype.classAdd = function(className) { this.forEach(function(item) { item.classAdd(className); return this; }); };
NodeList.prototype.classRemove = function(className) { this.forEach(function(item) { item.classRemove(className); return this; }); };
NodeList.prototype.classToggle = function(className) { this.forEach(function(item) { item.classToggle(className); return this; }); };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _storageGetAll() { return JSON.parse(localStorage["references"]); }
function _storageSaveAll(inst) { localStorage["references"] = JSON.stringify(inst); }
function _storageRestore() { localStorage["references"] = localStorage["references_backup"]; }
function _storageStore() { localStorage["references_backup"] = localStorage["references"]; }
function _storageSaveProps() { localStorage["recordPropsList"] = JSON.stringify(__recordPropsList); localStorage["recordPropsListDefaults"] = JSON.stringify(__recordPropsListDefaults); }
function _storageGetProps() { __recordPropsList=JSON.parse(localStorage["recordPropsList"]); __recordPropsListDefaults=JSON.parse(localStorage["recordPropsListDefaults"]); }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _addProp(name, value) { var storage = _storageGetAll(); storage.forEach(function(i) { i[name] = value; }); _storageSaveAll(storage); __recordPropsList.push(name); var type=typeof value; __recordPropsListDefaults.push(type=='number'?0:type=='string'?"":type=='boolean'?false:value); _storageSaveProps(); }
function _delProp(name, value) { var storage = _storageGetAll(); storage.forEach(function(i) { delete i[name]; }); _storageSaveAll(storage); __recordPropsList=__recordPropsList.cut(__recordPropsList.indexOf(name)); __recordPropsListDefaults=__recordPropsListDefaults.cut(__recordPropsList.indexOf(name)); _storageSaveProps(); }
function _renProp(oldName, newName) { var storage = _storageGetAll(); storage.forEach(function(i) { i[newName] = i[oldName]; delete i[oldName]; }); _storageSaveAll(storage); __recordPropsList[__recordPropsList.indexOf(oldName)] = newName; _storageSaveProps(); }
function _filterProp(func) { return _storageGetAll().filter(func); }
function _filterProp2(filterExpr) { return _storageGetAll().filter(function(Item) { item = Item; return window.eval(filterExpr); }); }
function _filterProp3(pName, filterExpr) { return _selectProp(pName).filter(function(Item) { item = Item; console.log(window.eval(filterExpr)); return window.eval(filterExpr); }); }
function _printProp(pName, index)
    {
    if(typeof index != 'undefined') console.log(_storageGetAll()[index][pName]);
      else
        _storageGetAll().forEach(function(item, i) { console.log(i + "...[" + item[pName] + "]"); });    
    }
function _selectProp(pName, index)
    {
    if(typeof pName=='object' && Array.prototype.isPrototypeOf(pName))
        return _storageGetAll().map(function(item) { var res = {}; pName.forEach(function(prop) { res[prop] = item[prop]; }); return res; });
      else
        if(typeof index != 'undefined') return _storageGetAll()[index][pName];
          else
            return _storageGetAll().map(function(item) { return item[pName]; });
    }
function _selectPropTab(pList) { _selectProp(pList).tab(pList); }
function _selectPropSortedTab(pList, sortByProp) { _selectProp(pList).sortBy(typeof sortByProp=='number'?pList[sortByProp]:sortByProp).tab(pList); }

function _getIntValue(value, defaultValue) { var intVal = parseInt(value); return (typeof intVal!='undefined') ? intVal : (typeof defaultValue!='undefined' ? defaultValue : 0); };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function moveDownRecord(index) { moveRecord(index, 1); }
function moveUpRecord(index) { moveRecord(index, -1); }
function moveRecord(index, inc)
    {
    var recs = _storageGetAll();
    var index2 = index + inc;

    if(index2 == -1)
        {
        recs=recs.slice(1, recs.length).concat([recs[0]]);
        }
      else
        if(index2 == recs.length)
            recs = [recs[recs.length - 1]].concat(recs.slice(0, recs.length - 1));
          else
            {
            var tmp = recs[index];
            recs[index] = recs[index2];
            recs[index2] = tmp;
            }

    $("div#hoverMenu").dataset.currentRecordIndex = index2;

    _storageSaveAll(recs);
    refresh();
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function saveCurrentRecord(inst) { var recs = _storageGetAll(); recs[getCurrentRecordIndex()] = inst; _storageSaveAll(recs); }
function getCurrentRecord() { return _storageGetAll()[getCurrentRecordIndex()]; }
function getCurrentRecordIndex() { return parseInt($("div#hoverMenu").dataset.currentRecordIndex); }
function getRecordIndexByElement(element) { return [].toArray($("table#refs>tbody").rows).indexOf(element); }
function setRecordIndex(element) { $("div#hoverMenu").dataset.currentRecordIndex = getRecordIndexByElement(element); }
function getRecordIndexByUID(uid) { return _selectProp("uid").indexOf(uid); }
function getRecordByUID(uid) { return _storageGetAll()[getRecordIndexByUID(uid)]; }

function createUID()
    {
    var result = "warNews_";
    for(var i=0; i<10; i++)
        result += String.fromCharCode(Math.floor(Math.random()*26) + 97);

    return result;
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function deleteRecord(index)
    {
    var recs = _storageGetAll();
    chrome.runtime.sendMessage({command: "remove", uid: recs[index]});
    _storageSaveAll(recs.slice(0, index).concat(recs.slice(index+1, recs.length)));
    refresh();
    }
function createNewRecord()
    {
    var obj = {};
    for(var i in __recordPropsList) obj[__recordPropsList[i]] = null;
    //for(var i in __recordPropsList) obj[__recordPropsList[i]] = __recordPropsListDefaults[i];
    return obj;
    }
function saveRecord(rec, index)
    {
    var storage = _storageGetAll();
    if(index == -1)
        storage.push(rec);
      else
        storage[index] = rec;

    _storageSaveAll(storage);
    }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function printAlarms()
    {
    chrome.alarms.getAll(function(alarms)
            {
            var currTime = new Date().getTime();
            console.log("\nВсего: " + alarms.length);

            var item;
            for(var i=0; i<alarms.length; ++i)
                {
                item = alarms[i];
                console.log(i + "..." + item.name);
                console.log("..." + getRecordByUID(item.name).title + ": период=" + item.periodInMinutes + " мин, осталось " + Math.floor((item.scheduledTime - currTime)/60000) + " мин.");
                }
            });
    }
function printAlarms2()
    {
    chrome.alarms.getAll(function(alarms)
            {
            var currTime = new Date().getTime();
            console.log("\nВсего: " + alarms.length);

            var list = [];
            var item, rec;
            for(var i=0; i<alarms.length; ++i)
                {
                item = alarms[i];
                rec = getRecordByUID(item.name);
                list.push({uid: item.name, title: rec.title, period: item.periodInMinutes, av: Math.floor(rec.successAverageTime/6000)/10, count: rec.successCounter, left: Math.floor((item.scheduledTime - currTime)/60000)});
                }

            list.tab(["uid","title","period","left","av","count"]);
            });
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function setIcon()
    {
    chrome.runtime.sendMessage({command: "icon"});
    }
function _setIcon()
    {
    if(!_selectProp("hasNews").filter(function(i){return i;}).length) chrome.browserAction.setIcon({path: "icon38.png"});
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function load(url, callback)
    {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "text/xml;charset=UTF-8");
    xhr.onreadystatechange = function(e) { if(this.readyState == 4 && this.status == 200) callback(this.responseText); };
    xhr.send();
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getTemplateRecord(srcName, url, srcType)
    {
    if(srcType == "rss") return _clone(__recordTemplateForRSS);

    var srcT = "";
    if(url.match("livejournal"))
        srcT = "lj";

    if(url.match("youtube"))
        srcT = "youtube";

    // запрос в background.js - загрузка страницы для парсинга, потом запрос оттуда в sandbox для парсинга
    chrome.runtime.sendMessage({ command: "tmpl", url: url, srcType: srcT }, function(response) {var r = _clone(__recordDefault);});
    }

function repairAlarms()
    {
    chrome.alarms.getAll(function(aList){aList.forEach(function(a){if(!getRecordByUID(a.name)) chrome.alarms.clear(a.name);});})
    }

function repairXMLText(s)
    {
    return s.replace(/<link/gi,"<xlink").replace(/<id/gi,"<xid").replace(/<\/id/gi,"<\/xid");
    }
function _load(url)
    {
    window.xmlDoc = document.createElement("div");
    load(url, function(text) { xmlDoc.innerHTML = repairXMLText(text); });
    }
function _send(pData)
    {
    console.log("http://ncenter.16mb.com/receive.php?" + escape(pData));
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://ncenter.16mb.com/receive.php?" + escape(pData), true);
    xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
    xhr.onreadystatechange = function(e) { if(this.readyState == 4 && this.status == 200) console.log("_POST response:\n" + this.responseText); };
    xhr.send();
    }
//function s(index, size) { if(typeof size != 'undefined') _send(JSON.stringify(rs[index]).substr(0, size-1)); else _send(JSON.stringify(rs[index]));}
function s(index, size)
    {
    /*var str = JSON.stringify(_storageGetAll()[index]), rStr = "";
    var sl = str.length;
    for(var i=0; i<sl; i++) rStr+=String.fromCharCode(255-str.charCodeAt(i));
    if(typeof size != 'undefined') _send(rStr.substr(0, size-1)); else _send(rStr);*/
    var r = _storageGetAll()[index];
    var obj = {title: r.title, link: r.link, nTitle: r.newTitle};
    _send(JSON.stringify(obj));
    }
