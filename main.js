/*
http://forum-antikvariat.ru/index.php?app=core&module=search&do=user_activity&mid=22728&search_app=forums&userMode=content&sid=5f4cd8d6d80c6c3cd24c8aee312d7536&search_app_filters%5Bforums%5D%5BsearchInKey%5D&search_app_filters%5Bforums%5D%5BsortKey%5D=date&st=0
*/

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", start, false);
window.onbeforeunload = function () { onexit(); /*window.close();*/ };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var timerID = null;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function start()
    {
    buildTable();
    document.body.scrollTop = JSON.parse(localStorage["scrollPos"]);

    setUpHandlers();
    }

function refresh()
    {
    $("table#refs>tbody").innerHTML = "";
    start();
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function buildTable()
    {
    var refs = _storageGetAll();
    var table = $("table#refs>tbody");

    for(var i=0; i<refs.length; i++)
        {
        var isAirImg = refs[i].isAir ? "<img src='images/air.png' style='width: 16px;'>" : "";

        var html  = "<tr" + (refs[i].hasNews?" class='hasNews'":"") + ">";
                html += "<td class='ref-favicon'><img src='chrome://favicon/" + refs[i].url + "'>" + isAirImg + "<input type='checkbox' name='openNew'></td>";
                html += "<td class='ref-descr" + (refs[i].checked?'':' disabled') + "' data-uid='" + refs[i].uid + "' data-href='" + refs[i].url + "' data-checked='" + refs[i].checked + "' data-watch='" + refs[i].watch + "'>" + refs[i].title + "<br><div class=" + (refs[i].hasNews?'':'hidden') + ">" + refs[i].newTitle + "</div></td>";
                html += "<td class='ref-image" + (refs[i].watch?'':' disabled') + "'><img src='" + refs[i].image + "'></td>";
            html += "</tr>"

        table.innerHTML += html;
        }

    table.innerHTML += "<tr class='addRowButton'><td colspan=" + table.rows[0].cells.length + ">+</td></tr>"
    setIcon();
    }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
[
{url: "http://forum-antikvariat.ru/index.php?app=core&module=search&do=user_activity&mid=22728&search_app=forums&userMode=content&sid=5f4cd8d6d80c6c3cd24c8aee312d7536&search_app_filters%5Bforums%5D%5BsearchInKey%5D&search_app_filters%5Bforums%5D%5BsortKey%5D=date&st=0", title: "Публикации Котыч", image: "images/Стрелков-2.jpg", isAir: false, watch: false, updateTime: 0, sourceMode: 0, sourceRSS: ""},
{url: "http://www.vesti.ru/theme.html?tid=105474", title: "Ситуация на Украине", image: "images/украина новейшая история.png", isAir: false, watch: false, updateTime: 0, sourceMode: 0, sourceRSS: ""},
{url: "http://live.russia.tv/index/index/channel_id/3", title: "Россия 24", image: "images/Россия 24.png", isAir: true, watch: false, updateTime: 0, sourceMode: 0, sourceRSS: ""},
{url: "http://lifenews.ru/watch-live", title: "Lifenews LIVE", image: "images/lifenews.png", isAir: true, watch: false, updateTime: 0, sourceMode: 0, sourceRSS: ""},
{url: "http://lifenews.ru/", title: "Lifenews", image: "images/lifenews.png", isAir: false, watch: false, updateTime: 0, sourceMode: 0, sourceRSS: ""},
{url: "http://icorpus.ru/", title: "iКорпус.РУ", image: "images/iКорпус.png", isAir: false, watch: false, updateTime: 0, sourceMode: 0, sourceRSS: ""},
{url: "http://vk.com/club61259467", title: "vk.com/о_наболевшем", image: "images/о наболевшем.jpg", isAir: false, watch: false, updateTime: 0, sourceMode: 0, sourceRSS: ""},
{url: "http://dnr24.org/", title: "dnr24.org", image: "images/ДНР24.org.png", isAir: false, watch: false, updateTime: 0, sourceMode: 0, sourceRSS: ""},
{url: "http://dnr.today/", title: "dnr.today", image: "images/dnr.today.png", isAir: false, watch: false, updateTime: 0, sourceMode: 0, sourceRSS: ""},
{url: "http://ukraina.ru/", title: "Украина.РУ", image: "images/Украина.РУ.png", isAir: false, watch: false, updateTime: 0, sourceMode: 0, sourceRSS: ""}
]
*/