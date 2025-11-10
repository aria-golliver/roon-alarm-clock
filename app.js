var RoonApi = require("node-roon-api");
var RoonApiStatus = require("node-roon-api-status");

var roon = new RoonApi({
    extension_id: 'com.frociaggine.alarm-clock',
    display_name: "Alarm Clock",
    display_version: "1.0.0",
    publisher: 'frociaggine.com',
    email: 'aria@frociaggine.com',
    website: 'https://bsky.app/profile/aria.di.frociaggine.com',
    log_level: 'all'
});

var svc_status = new RoonApiStatus(roon);

roon.init_services({
    provided_services: [svc_status]
});

svc_status.set_status("👍 all good 👍", false);

roon.start_discovery();