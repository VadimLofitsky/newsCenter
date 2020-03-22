function sourceEditWindowOpen(url, title, index)
    {
    if(index == -1)
        sourceEditParseSource(url);
      else
        {
        $("div#sourceEdit>input#sourceEditURL").value = url;
        $("div#sourceEdit>input#sourceEditTitle").value = title;
        }

    sourceEditButtonSave.currentIndex = index;
    sourceEditWindowShow();
    $("div#sourceEdit button#sourceEditButtonSave").onclick = sourceEditButtonSave;
    $("div#sourceEdit button#sourceEditButtonCancel").onclick = sourceEditButtonCancel;

    $("div#sourceEdit>input#sourceEditWatch").onchange = function(ev) { sourceEditWatchDivStatus(ev.srcElement.checked); };

    sourceEditWatchDivStatus($("div#sourceEdit>input#sourceEditWatch").checked);
    }
function sourceEditWindowClose(callback)
    {
    if(callback) callback();
    }

function sourceEditButtonSave()
    {
    var isExistingRecord = sourceEditButtonSave.currentIndex!=-1;
    var rec = getRecordFromSourceEditWindow();
    var index = sourceEditButtonSave.currentIndex;

    if(isExistingRecord)
        {
        var record = _storageGetAll()[index];
        rec = _expand(rec,
                {
                uid: record.uid,
                checked: record.checked,
                idLast: record.idLast,
                hasNews: false,
                successLastTStamp: record.successLastTStamp,
                successCounter: record.successCounter,
                successAverageTime: record.successAverageTime
                });
        recordHasNews(record.uid, false);
        }
      else
        {
        rec = _expand(rec, __recordDefault, 1);
        rec.uid = createUID();
        }

    saveRecord(rec, index);
    if(rec.watch)
        {
        if(!isExistingRecord || (isExistingRecord && rec.updateTime!=record.updateTime))
            {
            console.log("adding alarm");
            chrome.runtime.sendMessage({command:"add", uid: rec.uid, period: rec.updateTime});
            }
        }
      else
        chrome.runtime.sendMessage({command:"remove", uid: rec.uid});
    sourceEditWindowHide();

    refresh();
    }
function sourceEditButtonCancel()
    {
    sourceEditWindowHide();
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getRecordFromSourceEditWindow()
    {
    return {
        url: $("div#sourceEdit>input#sourceEditURL").value,
        title: $("div#sourceEdit>input#sourceEditTitle").value,
        image: $("div#sourceEdit>input#sourceEditImage").value,
        isAir: $("div#sourceEdit>input#sourceEditIsAir").checked,

        watch: $("div#sourceEdit>input#sourceEditWatch").checked,
        updateTime: _getIntValue($("div#sourceEditWatchDiv>input#sourceEditWatchTime").value, 0),

        source: $("div#sourceEditWatchDiv>input#sourceEditWatchSrc").value,
        idEvalStr: $("div#sourceEditWatchDiv>textarea#sourceEditWatchIDEvalStr").value,
        linkEvalStr: $("div#sourceEditWatchDiv>textarea#sourceEditWatchLinkEvalStr").value,
        titleEvalStr: $("div#sourceEditWatchDiv>textarea#sourceEditWatchTitleEvalStr").value
        };
    }

function fillSourceEditWindowWithRecord(rec)
    {
    $("div#sourceEdit>input#sourceEditURL").value = rec.url;
    $("div#sourceEdit>input#sourceEditTitle").value = rec.title;
    $("div#sourceEdit>input#sourceEditImage").value = rec.image;
    $("div#sourceEdit>input#sourceEditIsAir").checked = rec.isAir;

    $("div#sourceEdit>input#sourceEditWatch").checked = rec.watch;
    $("div#sourceEditWatchDiv>input#sourceEditWatchTime").value = rec.updateTime;

    $("div#sourceEditWatchDiv>input#sourceEditWatchSrc").value = rec.source;
    $("div#sourceEditWatchDiv>textarea#sourceEditWatchIDEvalStr").value = rec.idEvalStr;
    $("div#sourceEditWatchDiv>textarea#sourceEditWatchLinkEvalStr").value = rec.linkEvalStr;
    $("div#sourceEditWatchDiv>textarea#sourceEditWatchTitleEvalStr").value = rec.titleEvalStr;
    }

function sourceEditParseSource(url)
    {
    if(url.toLowerCase().indexOf("livejournal") != -1) sourceEditParseSourceLJ(url);
    if(url.toLowerCase().indexOf("youtube") != -1) chrome.extension.getBackgroundPage().postMessage({command: "parseYT", url: url}, "*");
    }
function sourceEditParseSourceLJ(url)
    {
    var rec = _clone(__recordTemplateForLJ);
    rec.url = /(http:\/\/.*\.livejournal.com).*/gi.exec(url)[1];
    rec.title = /http:\/\/(.*)\.livejournal.com.*/gi.exec(url)[1] + " . LiveJournal";
    rec.source = /(http:\/\/.*\.livejournal.com).*/gi.exec(url)[1] + "/data/rss";
    fillSourceEditWindowWithRecord(rec);
    }