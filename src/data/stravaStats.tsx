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
      "All": { }
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
      this.convertToDisplayValues();
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
        let All = this.totals.All;

        let statBy = stat + by;
        if (!t[statBy])
          t[statBy] = [];
        if (!All[statBy])
          All[statBy] = [];

        let taStat = [ t[statBy], All[statBy] ];

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

  convertToDisplayValues() {
    for (let type in this.totals) {
      console.log(type);
      for (let statBy in this.totals[type]) {
        let stat = this.match(statBy, "stat");
        let by = this.match(statBy, "by");
        for (let index in this.totals[type][statBy]) {
          let item = this.totals[type][statBy][index];
          if (stat === "distance")
            item.value = (Math.round(item.value/1000*0.621372) + ' mi');
          if (stat === "time")
            item.value = (Math.round(item.value/60/60) + ' hrs');
          if (stat === "elevation")
            item.value = (this.formatNumber(Math.round(item.value*3.2)) + ' ft');
          if (stat === "speed") {
            if (type === "Ride")
              item.value = (this.formatNumber((2.23694 * (item.value)).toFixed(2)) + ' mph');
            else
              item.value = (this.timeConvert((26.8224 / (item.value)).toFixed(2)));
          }
        }
      }
    }
  }
  timeConvert (minutes: any){
     var sign = minutes < 0 ? "-" : "";
     var min = Math.floor(Math.abs(minutes));
     var sec = Math.floor((Math.abs(minutes) * 60) % 60);
     return sign + (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
  }
  formatNumber(num: any) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }
  capitalize(s: any) {
    if (typeof s !== 'string') return '';
    s = s.replace(/([A-Z])/g, ' $1').trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  getTotals() {
    return {
      totals: this.totals,
      stats: this.statsToTrack,
      by: this.thingsToTrackBy,
    };
  }
}
