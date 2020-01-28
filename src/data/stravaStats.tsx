import { Dispatch, SetStateAction } from 'react';
interface StringIter {
  [index: string]: any,
}

export const  getAccessToken = async (code: string, setCode: Dispatch<SetStateAction<string>>, setAccessInfo: Dispatch<SetStateAction<string>> ) => {
  console.log("getting access token");
  var url = "https://www.strava.com/oauth/token";
  var data = {
    "client_id": "41457",
    "client_secret": "e28ef93238546fb930bdf561ce8aabe5670eee13",
    "code": code,
    "grant_type": "authorization_code"
  };
  var options = {
    method: 'post',
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(data)
  }
  fetch(url, options)
  .then((json) => {
    if (json.status === 200)
      return json.json();
    else {
      setCode("");
      window.history.pushState("", "", '/');
    }
  })
  .then((data) => {
    if (!data)
      return;
    console.log(data);
    setAccessInfo(JSON.stringify(data));
    window.history.pushState("", "", '/');
  });
}

export const getActivities = async (activities: any, accessInfo: any, setFinishedLoadingActivities: any, after?: number, ) => {
  console.log("getting Activities");
  await refreshAccessToken(accessInfo);
  let accessInfoObj = JSON.parse(accessInfo);
  let localActivities = activities.get();

  let token = accessInfoObj.access_token;
  var url = "https://www.strava.com/api/v3/athlete/activities";
  var queryData:StringIter = {
    "access_token": `${token}`,
    "page": 1,
    "per_page": 200,
    "after": after
  };
  let paramsString = new URLSearchParams();
  for (let key in queryData) {
    paramsString.append(key, queryData[key]);
  }

  fetch(url + "?" + paramsString.toString())
  .then((json) => {
    if (json.status === 200)
      return json.json();
    else {
      console.log("failed to retrieve activities");
      console.log(json);
    }
  })
  .then((data) => {
    localActivities = localActivities.concat(data);
    localActivities.sort(function (b: any, a: any) {
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    });
    if (data.length === 0) {
      setFinishedLoadingActivities(true);
      console.log("finished downloading activities");
      return
    }
    activities.set(localActivities);
  });



/**

  return await $.get(url, queryData, (data) => {
  })
  .fail((e) => {
    this.finishedGettingActivities = true;
    if (e.responseJSON.message == "Authorization Error") {
      console.log("Auth error");
      this.clearData();
    }
    console.log(e.responseText);
  })
  **/
}

export const refreshAccessToken = async (accessInfo: any) => {
  let accessInfoObj = JSON.parse(accessInfo);

  let expireDate = new Date(accessInfoObj.expires_at*1000);
  if (expireDate>new Date())
    return;

  var url = "https://www.strava.com/oauth/token";
  var data = {
    "client_id": "41457",
    "client_secret": "e28ef93238546fb930bdf561ce8aabe5670eee13",
    "refresh_token": accessInfoObj.refresh_token,
    "grant_type": "refresh_token"
  };
  var options = {
    method: 'post',
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(data)
  }
  fetch(url, options)
  .then((json) => {
    return json.json();
  })
  .then((data) => {
    if (!data || data.message !== "success") {
      console.log(data);
      return;
    }
    accessInfo.set(JSON.stringify(data));
    console.log("refreshAccessToken success");
  });
}



/**
$.post(url, data, function (data) {
  localStorage.setItem("loginData", JSON.stringify(data));
  window.location.replace(this.url);
  console.log("getAccessToken success");
})
.fail(function (e) {
  console.log("getAccessToken Failed: " + e.responseText);
  if (e.responseJSON.message == "Authorization Error") {
    console.log("Auth error");
    this.clearData();
  }
});


define (function (require) {
  var $ = require('jquery');
  require('jqueryui');
  var WhichState = require('whichState');

  class StravaStats {
    constructor() {
      this.server = "https://bradleygraber.com/strava/process.php";
      this.url = "https://bradleygraber.com/strava";

      this.loginData = localStorage.getItem("loginData");
      this.activities = localStorage.getItem("activities");
      //this.loginData = '{"token_type":"Bearer","expires_at":1578131249,"expires_in":21328,"refresh_token":"2d8f89959c0a42f5fe899d54147208b1a86a9aca","access_token":"405845a4cdc52a12afea1a624a31542eb42efb50","athlete":{"id":14087463,"username":null,"resource_state":2,"firstname":"Erica","lastname":"Yoder","city":null,"state":null,"country":null,"sex":"F","premium":false,"summit":false,"created_at":"2016-03-23T18:59:12Z","updated_at":"2019-12-30T04:38:42Z","badge_type_id":0,"profile_medium":"https:\/\/graph.facebook.com\/10104706225702862\/picture?height=256&width=256","profile":"https:\/\/graph.facebook.com\/10104706225702862\/picture?height=256&width=256","friend":null,"follower":null}}'
      if (this.loginData) {
        this.loginData = JSON.parse(this.loginData);
        $.post(this.server, {cmd: "p", data: encodeURIComponent(JSON.stringify(this.loginData))}, function(data) {})
      }
      if (this.activities) {
        this.activities = JSON.parse(this.activities);
      }

      try {
        this.whichState = new WhichState();
      }
      catch (e) {
        console.log(e);
        throw "WhichState code required, but missing."
      }
      this.viewState = localStorage.getItem("stravaViewState");
      if (!this.viewState)
        this.viewState = {};
      else
        this.viewState = JSON.parse(this.viewState);

      this.totals = {
        "all": { }
      };
      this.statsToTrack = {
        "distance": "distance",
        "time": "moving_time",
        "elevation": "total_elevation_gain",
        "speed": "average_speed",
      }
      this.thingsToTrackBy = [
        "ByState",
        "ByYear"
      ]
      this.timer = new Date();
    }

    async init() {
      if (!this.loginData)
        return;

      $("#spinner").show();
      $("#mainDataView").hide();
      if (!this.activities) {
        let page = 1;
        this.finishedGettingActivities = false;
        do {
          await this.getActivities(page++);
        } while (!this.finishedGettingActivities);
      }
      else {
        await this.refreshActivities();
      }
      $(`#spinnerNum`).html("Processing Activities")
      setTimeout(() => {
        this.displayTotals();
      },      0);

    }
    clearData() {
      localStorage.removeItem("loginData");
      localStorage.removeItem("activities");
      localStorage.removeItem("stravaViewState");
      window.location.reload(true);
    }

    // Activity work
    async displayTotals() {
      this.totals = {
        "all": { }
      };
      this.timer = new Date();
      var types = await this.processActivites(this.activities);
      console.log("Time: " + (new Date() - this.timer));
      $(".dynamicUiElements").remove();
      types.forEach((type) => {
        $("#tabHeaders").append(
            `<li class="dynamicUiElements"><a href='#${type}tab'>${this.capitalize(type)}</a></li>`
        );
        $("#data").append(
          `<div class="dynamicUiElements" id='${type}tab' style="padding: 10px 0 0 0;"></div>`
        );
        let list = this.getList(type);
        $(`#${type}tab`).append(list);
      });
      $("#data").tabs("refresh");
      $("#mainDataView").show();
      $("#spinner").hide();
      this.setView();
      console.log("done");
    }
    async processActivites(activities, startFrom) {
      var start = startFrom === undefined ? 0 : startFrom;

      let i = start;
      for (; i < activities.length && i < start+200; i++) {
        try {
          this.addActivity(activities[i]);
        }
        catch (e) {
          console.log(e);
        }
      }
      if (i == activities.length) {
        this.calcAverages();
        this.sort();
        let types = [];
        for (var type in this.totals) {
          types.push(type);
        }
        return new Promise(resolve => {
          resolve(types);
        });
      }
      else {
        $("#spinnerNum").html(`Processing Activities: ${(i / this.activities.length * 100).toFixed(0)}%`)
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(this.processActivites(activities, i));
          }, 0);
        })
      }
    }
    calcAverages() {
      for (var type in this.totals) {
        for (var statBy in this.totals[type]) {
          let by = statBy.match(/([A-Z])\w+/g)[0];
          var stat = statBy.match(/^(.+?)(?=[A-Z])/g)[0];
          if (stat == "speed") {
            for (var item in this.totals[type][statBy]) {
              var count = this.totals[type][statBy][item].count;
              this.totals[type][statBy][item].value = this.totals[type][statBy][item].value / count;
            }
          }
        }
      }
    }
    sort() {
      for (var type in this.totals) {
        for (var statBy in this.totals[type]) {
          let by = statBy.match(/([A-Z])\w+/g)[0];
          if (by == "ByState") {
            this.totals[type][statBy].sort(function (b, a) {
              return a.value - b.value;
            });
          }
          else if (by == "ByYear"){
            this.totals[type][statBy].sort(function (a, b) {
              return a.name - b.name;
            });
          }
        }
      }
    }
    addActivity(a) {
      this.initializeType(a.type);
      if (a.start_latlng) {
        let point = { lat: a.start_latlng[0], lng: a.start_latlng[1] };
        var stateName = this.whichState.is(point);
      }
      else {
        var stateName = "Unknown";
      }
      var stateNum = 0;
      for (let i = 0; i < stateName.length; i++) {
        stateNum += (stateName.charCodeAt(i));
      }
      let date = new Date(a.start_date_local);
      let year = date.getFullYear();

      for (var iter in this.thingsToTrackBy) {
        var by = this.thingsToTrackBy[iter];
        if (by == "ByState")
          var info = { name: stateName, iter: stateNum };
        if (by == "ByYear")
          var info = { name: year, iter: year };
        for (var stat in this.statsToTrack) {
          let stravaName = this.statsToTrack[stat];
          let t = this.totals[a.type];
          let all = this.totals.all;

          let statBy = stat + by;
          if (!t[statBy])
            t[statBy] = [];
          if (!all[statBy])
            all[statBy] = [];

          let taStat = [ t[statBy], all[statBy] ];

          taStat.forEach(function (stats) {
            if (!stats[info.iter])
              stats[info.iter] = { name: info.name, value: 0, count: 0 };
            stats[info.iter].value += a[stravaName];
            stats[info.iter].count++;
          });
        }
      }
    }
    initializeType(type) {
      if (this.totals[type])
        return;
      this.totals[type] = { };
    }

    //HTML Functions
    getInitHTML(options) {
      let mainDiv = $(`<div style="max-width: 500px; margin: auto; min-height: 400px;" align="center" ></div>`)

      //Auth Div
      let stravaURL = "https://www.strava.com/oauth/authorize?client_id=41457&redirect_uri=https://bradleygraber.com/strava/&response_type=code&approval_prompt=auto&scope=activity:read_all";
      let authIcon = $(`<img src="${options.authIcon}">`);
      let authLink = $(`<a href="${stravaURL}"></a>`).append(authIcon);
      let authDiv = $(`<div id="auth" align="center" style="padding-top: 20px; display: none;"></div>`).append(authLink);

      //Spinner
      let spinnerGif = $(`<img style="height: 150px; width: 150px; margin-top: 65px;" src="css/images/giphy.gif">`);
      let spinnerText = $(`<div id="spinnerNum" style="position: relative; top: 50px; font-size: 24px;">Loading Strava Activities </div>`);
      let spinnerDiv = $(`<div class="ui-widget-content ui-corner-all" style="display: none; z-index: 50; top: 0px; left: 0px; position: relative; width: 100%;  min-height: 400px;" id="spinner"></div>`);
      spinnerDiv.append(spinnerGif);
      spinnerDiv.append(spinnerText);

      //Data div
      let mainDataView = $(`<div id="mainDataView" style="display: none;"></div>`);
      let tabHeaders = $(`<ul id="tabHeaders"></ul>`);
      let dataDiv = $(`<div id="data" align="center""></div>`).append(tabHeaders).tabs();
      mainDataView.append(dataDiv);

      //Button div
      let updateButton = $(`<button id="updateButton">Update Activities</button>`).click((e) => { this.init(); }).button();
      let clearDataButton = $(`<button class="redButton">Clear Data</button>`).click((e) => { this.clearData() }).button();
      let buttonDiv = $(`<div id="buttonDiv" align="center" style="padding: 5px;"></div>`);
      buttonDiv.append(updateButton);
      buttonDiv.append(clearDataButton);
      mainDataView.append(buttonDiv);

      mainDiv.append(authDiv);
      mainDiv.append(spinnerDiv);
      mainDiv.append(mainDataView);
      if (!this.loginData)
        authDiv.show();
      else
        spinnerDiv.show();

      return mainDiv;
    }
    show(element) {
      $(`#${element}`).show();
    }
    hide(element) {
      $(`#${element}`).hide();
    }
    getStatMenu(activityType, menuType) {
      let statMenu = $(`<select class="${menuType}" name="${activityType}StatsMenu" id="${activityType}StatsMenu"></select>`)
      let options = null;
      if (menuType == "stats") {
        options = [];
        for (var stat in this.statsToTrack) {
          options.push(stat)
        }
      }
      if (menuType == "by")
        options = this.thingsToTrackBy;
      for (var o in options) {
        let option = $(`<option>${this.capitalize(options[o])}</option>`);
        statMenu.append(option);
      }
      return statMenu;
    }
    capitalize (s) {
      if (typeof s !== 'string') return '';
      s = s.replace(/([A-Z])/g, ' $1').trim();
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    menuChanged (stat, by) {
      $(".stravaList").addClass("hidden");
      let statBy = stat.toLowerCase() + by.replace(/\s/g, "");
      $(`.${statBy}`).removeClass("hidden");
      $(".stats").val(stat);
      $(".by").val(by);
      this.viewState.statBy = {stat: stat, by: by};
      localStorage.setItem("stravaViewState", JSON.stringify(this.viewState));
    }
    setView() {
      if (this.viewState.statBy) {
        $(".stats").val(this.viewState.statBy.stat);
        $(".by").val(this.viewState.statBy.by);
      }
      if (this.viewState.activeTab)
        $( "#data" ).tabs({ active: this.viewState.activeTab });
      else
        $( "#data" ).tabs({ active: 0 });
      $("#allStatsMenu").trigger("change");
    }
    getList(type) {
      $( "#tabs" ).click((e) => {
        this.viewState.activeTab = $("#tabs").tabs( "option", "active" );
        localStorage.setItem("stravaViewState", JSON.stringify(this.viewState));
      });

      let statMenu = this.getStatMenu(type, "stats")
      .change((e) => {
        let stat = $(e.target).find(":selected").text()
        let by = $(e.target).siblings().find(":selected").text()
        this.menuChanged(stat, by);
      });

      let byMenu = this.getStatMenu(type, "by")
      .change((e) => {
        let stat = $(e.target).siblings().find(":selected").text();
        let by = $(e.target).find(":selected").text();
        this.menuChanged(stat, by);
      });

      let header = $(`<h3 style="margin: 10px; text-align: center;"></h3>`);
      header.append(statMenu);
      header.append(byMenu);
      let div = $(`<div class="ui-widget-content ui-corner-all" style="padding: 5px; display: inline-block; vertical-align: top;"></div>`)
      .append(header);

      for (var statBy in this.totals[type]) {
        let list = null;
        let by = statBy.match(/([A-Z])\w+/g)[0];
        var stat = statBy.match(/^(.+?)(?=[A-Z])/g)[0];
        let table = $(`<table class="hidden stravaList ${statBy}" style="border-collapse: collapse;"></table>`);
        var total = 0;
        for (var line in this.totals[type][statBy]) {
          var item = this.totals[type][statBy][line];
          total += item.value;
        }
        for (var line in this.totals[type][statBy]) {
          var item = this.totals[type][statBy][line];
          table.append(this.getListItem(item, type, stat, by, parseInt(line)+1, total));
        }
        if (stat == "distance" || stat == "time" || stat == "elevation")
          table.append(this.getListItem({name: "Total", value: total}, type, stat, by))
        div.append(table);
      }
      return div;
    }
    getListItem (item, type, stat, by, line, total) {
      var listItem = "";
      var border = "solid thin";
      if (item.name == "Total")
        var border = "none";
      var row = $(`<tr style="border: ${border};"></tr>`);
      if (by == "ByState") {
        var cell = $(`<td style="padding: 0 4px 0 4px; border: ${border};" align="center"></td>`);
        cell.append(line);
        row.append(cell);
      }
      var cell = $('<td style="padding: 0 2px 0 4px;" align="right"></td>');
      cell.append(item.name + ":&nbsp;")
      row.append(cell);
      cell = $('<td style="padding: 0 4px 0 0px;"></td>');
      if (stat == "distance")
        cell.append(Math.round(item.value/1000*0.621372) + ' mi');
      if (stat == "time")
        cell.append(Math.round(item.value/60/60) + ' hrs');
      if (stat == "elevation")
        cell.append(this.formatNumber(Math.round(item.value*3.2)) + ' ft');
      if (stat == "speed") {
        if (type == "Ride")
          cell.append(this.formatNumber((2.23694 * (item.value)).toFixed(2)) + ' mph');
        else
          cell.append(this.timeConvert((26.8224 / (item.value)).toFixed(2)));
      }
      row.append(cell);
      if (total && (stat == "distance" || stat == "time" || stat == "elevation")) {
        var cell = $(`<td style="padding: 0 4px 0 4px; border: ${border};" align="center">${(item.value/total*100).toFixed(0)}%</td>`);
        row.append(cell);
      }
      return row;
    }
    timeConvert (minutes){
       var sign = minutes < 0 ? "-" : "";
       var min = Math.floor(Math.abs(minutes));
       var sec = Math.floor((Math.abs(minutes) * 60) % 60);
       return sign + (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
    }
    formatNumber(num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    capitalize(s) {
      if (typeof s !== 'string') return '';
      s = s.replace(/([A-Z])/g, ' $1').trim();
      return s.charAt(0).toUpperCase() + s.slice(1);
    }

    // API functions
    async getActivities(page, after) {
    }
    async refreshActivities() {
      await this.refreshAccessToken();
      $("#spinnerNum").html("Loading Strava Activities");
      let date = new Date(this.activities[0].start_date);
      return await this.getActivities(1, date.getTime()/1000);
    }
    getAccessToken(code) {

    }
  }
  return StravaStats;
});

**/
