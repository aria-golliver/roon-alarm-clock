var RoonApi = require("node-roon-api");
var RoonApiStatus = require("node-roon-api-status");
var RoonApiTransport = require("node-roon-api-transport");

AlarmZones = {
    KefQ150: {
        Id: '160159f398ff576aff46bb2dedfdff98f359',
        OutputId: '170159f398ff576aff46bb2dedfdff98f359',
    },
    AriaEvoX: {
        Id: '1601f42f1178d925f9f368be5fb3ebb294e1',
        OutputId: '1701f42f1178d925f9f368be5fb3ebb294e1',
    },
}

var AlarmZone = AlarmZones.KefQ150
var AlarmVolumeRange = [0, 5] // alarm start volume, alarm end volume
var transport;
var roon = new RoonApi({
    extension_id: 'com.frociaggine.alarm-clock',
    display_name: "Alarm Clock",
    display_version: "1.0.0",
    publisher: 'frociaggine.com',
    email: 'aria@frociaggine.com',
    website: 'https://bsky.app/profile/aria.di.frociaggine.com',

    core_paired: function (core) {
        transport = core.services.RoonApiTransport;
        transport.subscribe_zones(function (cmd, data) {
            // console.log(core.core_id,
            //     core.display_name,
            //     core.display_version,
            //     "-",
            //     cmd,
            //     JSON.stringify(data, null, '  '));
        });
    },

    core_unpaired: function (core) {
        // console.log(core.core_id,
        //     core.display_name,
        //     core.display_version,
        //     "-",
        //     "LOST");
    }
});

var svc_status = new RoonApiStatus(roon);

roon.init_services({
    required_services: [RoonApiTransport],
    provided_services: [svc_status]
});

svc_status.set_status("👍 all good 👍", false);

roon.start_discovery();

function reset_volume() {
    console.log("resetting volume to", AlarmVolumeRange)
    transport.change_volume(AlarmZone.OutputId, 'absolute', AlarmVolumeRange[1], start_alarm)
}

function start_alarm() {
    console.log("starting alarm")
    transport.control(AlarmZone.Id, 'play')
}

function enable_radio() {
    console.log("enabling radio")
    transport.change_settings(AlarmZone.Id, { auto_radio: true }, reset_volume)
}

setTimeout(enable_radio, 2000)