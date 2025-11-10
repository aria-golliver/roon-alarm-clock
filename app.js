var RoonApi = require("node-roon-api");
var RoonApiStatus = require("node-roon-api-status");
var RoonApiTransport = require("node-roon-api-transport");

var roon = new RoonApi({
    extension_id: 'com.frociaggine.alarm-clock',
    display_name: "Alarm Clock",
    display_version: "1.0.0",
    publisher: 'frociaggine.com',
    email: 'aria@frociaggine.com',
    website: 'https://bsky.app/profile/aria.di.frociaggine.com',
    // log_level: 'all',


    core_paired: function (core) {
        let transport = core.services.RoonApiTransport;
        transport.subscribe_zones(function (cmd, data) {
            console.log(core.core_id,
                core.display_name,
                core.display_version,
                "-",
                cmd,
                JSON.stringify(data, null, '  '));
        });
    },

    core_unpaired: function (core) {
        console.log(core.core_id,
            core.display_name,
            core.display_version,
            "-",
            "LOST");
    }
});

var svc_status = new RoonApiStatus(roon);

roon.init_services({
    required_services: [RoonApiTransport],
    provided_services: [svc_status]
});

svc_status.set_status("👍 all good 👍", false);

roon.start_discovery();