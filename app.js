var RoonApi = require("node-roon-api");
var RoonApiStatus = require("node-roon-api-status");
var RoonApiTransport = require("node-roon-api-transport");
var RoonApiBrowse = require("node-roon-api-browse");

AlarmZones = {
    KefQ150: {
        Id: '160159f398ff576aff46bb2dedfdff98f359',
        OutputId: '170159f398ff576aff46bb2dedfdff98f359',
        MaxVolume: 0,
    },
    AriaEvoX: {
        Id: '1601f42f1178d925f9f368be5fb3ebb294e1',
        OutputId: '1701f42f1178d925f9f368be5fb3ebb294e1',
        MaxVolume: 35,
    },
}

var AlarmZone = AlarmZones.AriaEvoX
// TODO: sweep volume up to wake up gently?
var transport;

function switch_on() {
    console.log("switching on")
    transport.convenience_switch(AlarmZone.OutputId, {}, reset_volume)
}

function reset_volume() {
    let volume = AlarmZone.MaxVolume
    console.log("resetting volume to", volume)
    transport.change_volume(AlarmZone.OutputId, 'absolute', volume, play_song)
}

function play_song() {
    console.log("playing song")
    transport.control(AlarmZone.Id, 'play', finalize_alarm)
}

function finalize_alarm() {
    svc_status.set_status("👍 good morning babes 👍", false);
    process.exit(0)
}

var start_alarm = switch_on;

var roon = new RoonApi({
    extension_id: 'com.frociaggine.alarm-clock',
    display_name: "Alarm Clock",
    display_version: "1.0.0",
    publisher: 'frociaggine.com',
    email: 'aria@frociaggine.com',
    website: 'https://bsky.app/profile/aria.di.frociaggine.com',

    core_paired: function (core) {
        transport = core.services.RoonApiTransport;
        transport.subscribe_zones(function (response, msg) {
            if (response == "Subscribed") {
                let zones = msg.zones.map(zone => {
                    var outputs = zone['outputs'].map(output => {
                        return output['output_id']
                    })
                    return {
                        name: zone['display_name'],
                        id: zone['zone_id'],
                        outputs: outputs,
                    }
                });
                console.log("subscribed", zones)
                start_alarm()
            }
        });
    },

    core_unpaired: function (core) {
        console.log("Unpaired from roon, quitting...")
        process.exit(1)
    }
});

var svc_status = new RoonApiStatus(roon);

roon.init_services({
    required_services: [RoonApiTransport, RoonApiBrowse],
    provided_services: [svc_status]
});

svc_status.set_status("🙏 hope you wake up 🙏", false);

roon.start_discovery();