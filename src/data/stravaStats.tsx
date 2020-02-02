import { Dispatch, SetStateAction } from 'react';
import WhichState from './whichState';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

interface StringIter {
  [index: string]: any,
}

export default class StravaStats {
  server: string;
  url: string;
  loginData: any;
  activities: any;
  whichState: any;
  viewState: any;
  totals: any;
  statsToTrack: any;
  thingsToTrackBy: any;
  timer: any;
  setLoggedIn: Dispatch<SetStateAction<string>>;
  setLoadingNumber: Dispatch<SetStateAction<number>>;
  setFinishedDownloading: Dispatch<SetStateAction<boolean>>;
  setFinishedProcessing: Dispatch<SetStateAction<boolean>>;
  types: any;

  constructor(
        setLoggedIn: Dispatch<SetStateAction<string>>,
        setFinishedDownloading: Dispatch<SetStateAction<boolean>>,
        setFinishedProcessing: Dispatch<SetStateAction<boolean>>,
        setLoadingNumber:Dispatch<SetStateAction<number>>,
        code?:string) {
    this.setLoggedIn = setLoggedIn;
    this.setFinishedDownloading = setFinishedDownloading;
    this.setFinishedProcessing = setFinishedProcessing;
    this.setLoadingNumber = setLoadingNumber;
    this.server = "https://bradleygraber.com/strava/process.php";
    this.url = "https://bradleygraber.com/strava";

    //this.loginData = '{"token_type":"Bearer","expires_at":1578131249,"expires_in":21328,"refresh_token":"2d8f89959c0a42f5fe899d54147208b1a86a9aca","access_token":"405845a4cdc52a12afea1a624a31542eb42efb50","athlete":{"id":14087463,"username":null,"resource_state":2,"firstname":"Erica","lastname":"Yoder","city":null,"state":null,"country":null,"sex":"F","premium":false,"summit":false,"created_at":"2016-03-23T18:59:12Z","updated_at":"2019-12-30T04:38:42Z","badge_type_id":0,"profile_medium":"https:\/\/graph.facebook.com\/10104706225702862\/picture?height=256&width=256","profile":"https:\/\/graph.facebook.com\/10104706225702862\/picture?height=256&width=256","friend":null,"follower":null}}'
    try {
      this.whichState = new WhichState();
    }
    catch (e) {
      console.log(e);
      throw new Error("WhichState code required, but missing.");
    }

    this.totals = {
      "all": { }
    };
    this.statsToTrack = {
      "distance": "distance",
      "time": "moving_time",
      "elevation": "total_elevation_gain",
      "speed": "average_speed",
    };
    this.thingsToTrackBy = [
      "ByState",
      "ByYear"
    ];
    this.types = [];
    this.timer = new Date();
    this.init(code);
  }

  async init(code?:string) {
//    console.log("stravaStats init - code=" + code);
    let savedStateString = await Storage.get({ key: 'stravaStatsState' })

    if (savedStateString.value !== null) {
      let savedStateObj = JSON.parse(savedStateString.value);
      this.loginData = savedStateObj.loginData;
      this.activities = savedStateObj.activities

    }
    if (code)
      await this.getAccessToken(code);
    else if (!this.loginData) {
      console.log("setting false");
      this.setLoggedIn("false");
    }
    else {
      this.setLoggedIn("true");
    }
    //      $.post(this.server, {cmd: "p", data: encodeURIComponent(JSON.stringify(this.loginData))}, function(data) {})
  }

  async getAccessToken(code: string) {
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
        window.history.pushState("", "", '/');
        this.setLoggedIn("false");
      }
    })
    .then((data) => {
      if (!data)
        return;
      this.loginData = data;
      window.history.pushState("", "", '/');
      this.saveState().then(() => {
        this.setLoggedIn("true");
      });
    });
  }
  async refreshAccessToken() {
    let accessInfoObj = this.loginData;

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
    return await fetch(url, options)
    .then((json) => {
      return json.json();
    })
    .then((data) => {
      if (!data) {
        return;
      }
      this.loginData = data;
      this.saveState();
      console.log("refreshAccessToken success");
    });
  }

  async saveState() {
    Storage.set({key: "stravaStatsState", value: JSON.stringify(
      {
        loginData: this.loginData,
        activities: this.activities,
      }
    )});
  }

  async getActivities() {
    if (this.activities)
      var after = this.activities.length > 1 ? new Date(this.activities[0].start_date).getTime()/1000 : undefined;
    console.log("refreshing token");
    await this.refreshAccessToken();
    console.log("getting activities");
    let accessInfoObj = this.loginData;
    let localActivities = this.activities ? this.activities : [];

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
      if (data) {
        if (data.length === 0) {
          console.log("finished downloading activities");
          this.setFinishedDownloading(true);
          this.processActivities();
          console.log(this.activities.length);
          return
        }

        localActivities = localActivities.concat(data);
        localActivities.sort(function (b: any, a: any) {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        });

        this.activities = localActivities.slice();
        this.setLoadingNumber(this.activities.length);
        console.log(this.activities.length);
        this.saveState().then(() => {
          this.getActivities()
        });
      }
      else {
        console.log(data);
      }
    });
  }
  async processActivities(startFrom?: number) {
    var start = startFrom === undefined ? 0 : startFrom;

    var i = start;
    for (; i < this.activities.length && i < start+200; i++) {
      try {
        this.addActivity(this.activities[i]);
      }
      catch (e) {
        console.log(e);
      }
    }
    if (i === this.activities.length) {
      this.setLoadingNumber(100);
      this.calcAverages();
      this.sort();
      for (var type in this.totals) {
        this.types.push(type);
      }
      this.setFinishedProcessing(true);
      return new Promise(resolve => {
        resolve(this.types);
      });
    }
    else {
      let percent:number = parseInt((i / this.activities.length * 100).toFixed(0));
      this.setLoadingNumber(percent);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(this.processActivities(i));
        }, 10);
      })
    }
  }
  initializeType(type: string) {
    if (this.totals[type])
      return;
    this.totals[type] = { };
  }
  addActivity(a: any) {
    this.initializeType(a.type);
    var stateName = "Unknown";
    if (a.start_latlng) {
      let point = { lat: a.start_latlng[0], lng: a.start_latlng[1] };
      stateName = this.whichState.is(point);
    }
    var stateNum = 0;
    for (let i = 0; i < stateName.length; i++) {
      stateNum += (stateName.charCodeAt(i));
    }
    let date = new Date(a.start_date_local);
    let year = date.getFullYear();

    for (var iter in this.thingsToTrackBy) {
      var by = this.thingsToTrackBy[iter];
      var info = { name: "", iter: 0};
      if (by === "ByState")
        info = { name: stateName, iter: stateNum };
      if (by === "ByYear")
        info = { name: year.toString(), iter: year };
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

        // eslint-disable-next-line
        taStat.forEach(function (stats) {
          if (!stats[info.iter])
            stats[info.iter] = { name: info.name, value: 0, count: 0 };
          stats[info.iter].value += a[stravaName];
          stats[info.iter].count++;
        });
      }
    }
  }
  calcAverages() {
    for (var type in this.totals) {
      for (var statBy in this.totals[type]) {
//        let by = this.match(statBy, "by");
        var stat = this.match(statBy, "stat");
        if (stat === "speed") {
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
        let by = this.match(statBy, "by");
        if (by === "ByState") {
          this.totals[type][statBy].sort(function (b:any, a:any) {
            return a.value - b.value;
          });
        }
        else if (by === "ByYear"){
          this.totals[type][statBy].sort(function (a:any, b:any) {
            return a.name - b.name;
          });
        }
      }
    }
  }
  match(string:string, match:string) {
    let regex = /([A-Z])\w+/g;
    if (match === "by")
      regex = /([A-Z])\w+/g;
    if (match === "stat")
      regex = /^(.+?)(?=[A-Z])/g;
    let value = string.match(regex);
    if (value)
      return value[0];
    return "";
  }

  getTotals() {
    return this.totals;
  }

/**
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
  async processActivites(activities, startFrom?: any) {
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
    if (i === activities.length) {
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
    if (menuType === "stats") {
      options = [];
      for (var stat in this.statsToTrack) {
        options.push(stat)
      }
    }
    if (menuType === "by")
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
      if (stat === "distance" || stat === "time" || stat === "elevation")
        table.append(this.getListItem({name: "Total", value: total}, type, stat, by))
      div.append(table);
    }
    return div;
  }
  getListItem (item, type, stat, by, line, total) {
    var listItem = "";
    var border = "solid thin";
    if (item.name === "Total")
      var border = "none";
    var row = $(`<tr style="border: ${border};"></tr>`);
    if (by === "ByState") {
      var cell = $(`<td style="padding: 0 4px 0 4px; border: ${border};" align="center"></td>`);
      cell.append(line);
      row.append(cell);
    }
    var cell = $('<td style="padding: 0 2px 0 4px;" align="right"></td>');
    cell.append(item.name + ":&nbsp;")
    row.append(cell);
    cell = $('<td style="padding: 0 4px 0 0px;"></td>');
    if (stat === "distance")
      cell.append(Math.round(item.value/1000*0.621372) + ' mi');
    if (stat === "time")
      cell.append(Math.round(item.value/60/60) + ' hrs');
    if (stat === "elevation")
      cell.append(this.formatNumber(Math.round(item.value*3.2)) + ' ft');
    if (stat === "speed") {
      if (type === "Ride")
        cell.append(this.formatNumber((2.23694 * (item.value)).toFixed(2)) + ' mph');
      else
        cell.append(this.timeConvert((26.8224 / (item.value)).toFixed(2)));
    }
    row.append(cell);
    if (total && (stat === "distance" || stat === "time" || stat === "elevation")) {
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
    console.log("activities length" + this.activities.length);
    await this.refreshAccessToken();
    let token = this.loginData.access_token;
    var url = "https://www.strava.com/api/v3/athlete/activities";
    var queryData = {
      "access_token": `${token}`,
      "page": page,
      "per_page": 200,
    };
    if (after)
      queryData.after = after;

    return await $.get(url, queryData, (data) => {
      if (!this.activities)
        this.activities = [];
      this.activities = this.activities.concat(data);
      if (data.length === 200) {
        this.finishedGettingActivities = false;
        $("#spinnerNum").html(`Activities Downloaded: ${page * 200}`);
      }
      else {
        this.activities.sort(function (b, a) {
          return new Date(a.start_date) - new Date(b.start_date);
        });
        this.finishedGettingActivities = true;
        localStorage.setItem("activities", JSON.stringify(this.activities));
        console.log("finished downloading activities");
      }
    })
    .fail((e) => {
      this.finishedGettingActivities = true;
      if (e.responseJSON.message === "Authorization Error") {
        console.log("Auth error");
        this.clearData();
      }
      console.log(e.responseText);
    })
  }
  async refreshActivities() {
    await this.refreshAccessToken();
    $("#spinnerNum").html("Loading Strava Activities");
    let date = new Date(this.activities[0].start_date);
    return await this.getActivities(1, date.getTime()/1000);
  }
  getAccessToken(code) {
    var url = "https://www.strava.com/oauth/token";
    var server = "https://bradleygraber.com/strava/process.php"
    var data = {
      "client_id": "41457",
      "client_secret": "e28ef93238546fb930bdf561ce8aabe5670eee13",
      "code": code,
      "grant_type": "authorization_code"
    };
    $.post(url, data, function (data) {
      localStorage.setItem("loginData", JSON.stringify(data));
      window.location.replace(this.url);
      console.log("getAccessToken success");
    })
    .fail(function (e) {
      console.log("getAccessToken Failed: " + e.responseText);
      if (e.responseJSON.message === "Authorization Error") {
        console.log("Auth error");
        this.clearData();
      }
    });
  }
  async refreshAccessToken() {
    let expireDate = new Date(this.loginData.expires_at*1000);
    if (expireDate>new Date())
      return;

    var url = "https://www.strava.com/oauth/token";
    var data = {
      "client_id": "41457",
      "client_secret": "e28ef93238546fb930bdf561ce8aabe5670eee13",
      "refresh_token": this.loginData.refresh_token,
      "grant_type": "refresh_token"
    };
    return await $.post(url, data, (data) => {
      localStorage.setItem("loginData", JSON.stringify(data));
      this.loginData = data;
      console.log("refreshAccessToken success");
    })
    .fail(function (e) {
      console.log("refreshAccessToken failed: " + e.responseText);
      if (e.responseJSON.message === "Authorization Error") {
        console.log("Auth error");
        this.clearData();
      }
    });
  }
**/
}


/**
function addActivity (a, state) {
  let totals = state.totals.get();

  if (!totals[type])
    totals[type] = { };

  if (a.start_latlng) {
    let point = { lat: a.start_latlng[0], lng: a.start_latlng[1] };
//    var stateName = this.whichState.is(point);
    var stateName = "Arizona";
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
    }
    initializeType(type) {
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
