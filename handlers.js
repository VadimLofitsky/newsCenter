var _shiftKey = false, _altKey = false;

function openButtonTitle(shift, alt, isKeyDown)
    {
    var s = "";

    $("button.button-open>div").innerHTML = s;
    }

function setUpHandlers()
    {
    $("body").onkeydown = function(ev)
            {
            if(ev.altKey && !ev.shiftKey)
                {
                _altKey = true;
                $("button.button-open>div").innerHTML = ">>> Сбросить <<<";
                }

            if(ev.shiftKey)
                {
                _shiftKey = true;
                if(!$("div#sourceEdit").classList.contains("sourceEditHidden")) return;
                $$("tr:not(.hasNews)").classAdd("hidden");
                if(!ev.altKey)
                    $("button.button-open>div").innerHTML = ">>> Открыть с новостями <<<";
                }
            };

    $("body").onkeyup = function(ev)
            {
            if(ev.keyIdentifier.toLowerCase() == "alt")
                _altKey = false;
                $("button.button-open>div").innerHTML = "<<< Открыть >>>";

            if(ev.keyIdentifier.toLowerCase() == "shift")
                {
                _shiftKey = false;
                if($("div#sourceEdit").classList.contains("sourceEditHidden"))
                    {
                    $$("tr.hidden").classRemove("hidden");
                    $("button.button-open>div").innerHTML = "<<< Открыть >>>";
                    }
                }
            };

    $("table#refs").onclick = onTableClick;

    $("button.button-open").onclick = openSelected;

    $$("td[class*=ref]").forEach(function(item) {item.onmouseenter = function(ev)
            {
            if(_shiftKey || _altKey || !$("div#sourceEdit").classList.contains("sourceEditHidden")) return;

            if(timerID)
                {
                window.clearInterval(timerID);
                hoverMenuHide();
                }

            timerID = window.setTimeout(function()
                    {
                    hoverMenuShow(ev.x, ev.y, ev.srcElement.parentElement);
                    
                    ev.srcElement.onmouseleave = function(ev2)
                            {
                            if(ev2.toElement && ev2.toElement.matches("[id*=hoverMenu]"))
                                {
                                $("div#hoverMenu").onmouseleave = function(ev3)
                                    {
                                    window.clearInterval(timerID);
                                    timerID = null;
                                    hoverMenuHide();
                                    };
                                return;
                                }

                            window.clearInterval(timerID);
                            timerID = null;
                            hoverMenuHide();
                            };
                    }, 1000);
            };} );

    $("div#hoverMenu>img#hoverMenuOpen").onclick = function (ev) { setToOpen(getCurrentRecordIndex()); };
    $("div#hoverMenu>img#hoverMenuWatch").onclick = function (ev) { setToWatch(getCurrentRecordIndex()) };
    $("div#hoverMenu>img#hoverMenuUp").onclick = function (ev) { moveUpRecord(getCurrentRecordIndex()); };
    $("div#hoverMenu>img#hoverMenuDown").onclick = function (ev) { moveDownRecord(getCurrentRecordIndex()); };
    $("div#hoverMenu>img#hoverMenuEdit").onclick = function (ev) { editRecord(getCurrentRecordIndex()); };
    $("div#hoverMenu>img#hoverMenuDel").onclick = function (ev) { deleteRecord(getCurrentRecordIndex()); };
    $("div#hoverMenu>div#hoverMenuTitle").onclick = function (ev)
            {
            if(this.dataset.link == "") return;

            var link = this.dataset.link;
            recordHasNews(_storageGetAll()[getCurrentRecordIndex()].uid, false);
            this.dataset.link = "";

            chrome.tabs.create({url: link});
            };

    chrome.runtime.onMessage.addListener(function(message, _, sendResponse)
            {
            switch(message.command)
                {
                case "refresh":
                    refresh();
                    break;
                ///////////////////////////////////////////
                case "parseYTResponse":
                    var rec = _clone(__recordTemplateForYoutube);
                    rec.url = "https://www.youtube.com/" + message.url.substr(52) + "/videos";
                    rec.title = message.title + " - YouTube";
                    var channelName = /.*\/channel\/(.*)|user\/(.*)/gi.exec(message.url);
                    channelName = channelName[1] ? channelName[1] : channelName[2];
                    rec.source = "https://gdata.youtube.com/feeds/api/users/" + channelName + "/uploads?v=2";
                    fillSourceEditWindowWithRecord(rec);
                    break;
                }
            });
    }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function onTableClick(ev)
    {
    var el = ev.srcElement;

    if(el.tagName.toUpperCase() == 'TD')
        {
        if(el.classList.contains("ref-descr"))
            chrome.tabs.create({url: el.dataset.href});

        if(el.parentElement.classList.contains("addRowButton"))
            addSource();
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function openSelected(ev)
    {
    if(ev.altKey)
        {
        var recs = _storageGetAll();
        recs.forEach( function(el){ el.hasNews = false; } )
        _storageSaveAll(recs);
        refresh();
        setIcon();
        return;
        }

    //var list = ev.shiftKey ? _storageGetAll().filter(function(el){return el.hasNews;}) : _storageGetAll().filter(function(el){return el.checked == true;});
    var list = ev.shiftKey ?
            $$("tr.hasNews>td.ref-favicon>input[type=checkbox]").filter(function(el) { return el.checked; }).map(function(el)
                    {
                    var recs = _storageGetAll();
                    recs.forEach( function(el){ el.hasNews = false; } )
                    _storageSaveAll(recs);
                    refresh();
                    setIcon();

                    return getRecordByUID(el.parentElement.parentElement.$("td.ref-descr").dataset.uid);
                    }) :
            list = _storageGetAll().filter(function(el){return el.checked == true;});

    $$("tr>td.ref-favicon>input[type=checkbox]").forEach(function(el) { el.checked = false; });
    chrome.runtime.sendMessage({command: "open", isOpeningNews: ev.shiftKey, list: list});
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addSource()
    {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) { sourceEditWindowOpen(tabs[0].url, tabs[0].title, -1); });
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function editRecord(index)
    {
    rec = _storageGetAll()[index];
    fillSourceEditWindowWithRecord(rec);
    sourceEditWindowOpen(rec.url, rec.title, index);
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function hoverMenuShow(x, y, rowElement)
    {
    setRecordIndex(rowElement);

    $("div#hoverMenu").classRemove("hoverMenuHidden");
    $("div#hoverMenu").style.left = (x + document.body.scrollLeft) + "px";
    $("div#hoverMenu").style.top = (y + document.body.scrollTop) + "px";
    $("div#hoverMenu #hoverMenuTitle").innerHTML = rowElement.$("td.ref-descr").innerHTML;

    var record = getCurrentRecord();
    $("div#hoverMenu img#hoverMenuOpen").src = "images/hoverMenuOpen_" + record.checked + ".png";
    $("div#hoverMenu img#hoverMenuWatch").src = "images/hoverMenuWatch_" + record.watch + ".png";
    $("div#hoverMenu #hoverMenuTitle").dataset.link = record.hasNews ? record.link : "";
    }
function hoverMenuHide() { $("div#hoverMenu").classAdd("hoverMenuHidden"); }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function sourceEditWindowShow()
    {
    $("div#sourceEdit").classRemove("sourceEditHidden");
    //$("div#sourceEdit").style.top = document.body.scrollTop + (document.body.clientHeight-$("div#sourceEdit").getBoundingClientRect().height)/4 + "px";
    }
function sourceEditWindowHide() { $("div#sourceEdit").classAdd("sourceEditHidden"); }
function sourceEditWatchDivStatus(status)
    {
    if(status)
        $("div#sourceEditWatchDiv").classRemove("sourceWatchDisabled");
      else
        $("div#sourceEditWatchDiv").classAdd("sourceWatchDisabled");
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function setToOpen(index)
    {
    var recs = _storageGetAll();
    recs[index].checked = !recs[index].checked;
    _storageSaveAll(recs);

    if(recs[index].checked)
        $$("table#refs tr")[index].$("td.ref-descr").classRemove("disabled");
      else
        $$("table#refs tr")[index].$("td.ref-descr").classAdd("disabled");

    $("div#hoverMenu img#hoverMenuOpen").src = $("div#hoverMenu img#hoverMenuOpen").dataset.fnamemask.replace("@", recs[index].checked);
    }
function setToWatch(index)
    {
    var recs = _storageGetAll();
    recs[index].watch = !recs[index].watch;
    _storageSaveAll(recs);

    if(recs[index].watch)
        {
        $$("table#refs tr")[index].$("td.ref-image").classRemove("disabled");
        if(recs[index].updateTime != 0) chrome.runtime.sendMessage({command:"add", uid: recs[index].uid, period: recs[index].updateTime});
        }
      else
        {
        $$("table#refs tr")[index].$("td.ref-image").classAdd("disabled");
        chrome.runtime.sendMessage({command:"remove", uid: recs[index].uid});
        }

    $("div#hoverMenu img#hoverMenuWatch").src = $("div#hoverMenu img#hoverMenuWatch").dataset.fnamemask.replace("@", recs[index].watch);
    }

function recordHasNews(uid, hasIt, lastID)
    {
    var recs = _storageGetAll();
    var index = getRecordIndexByUID(uid);
    if(recs[index].hasNews = hasIt)
        {
        recs[index].idLast = lastID;
        $$("table#refs tr")[index].classAdd("hasNews");
        }
      else
        {
        $$("table#refs tr")[index].classRemove("hasNews");
        }

    _storageSaveAll(recs);
    setIcon();
    }

window.onscroll = function(ev)
        {
        localStorage["scrollPos"] = document.body.scrollTop;
        };