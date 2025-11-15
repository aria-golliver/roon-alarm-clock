var RoonApi = require("node-roon-api")
var RoonApiStatus = require("node-roon-api-status")
var RoonApiTransport = require("node-roon-api-transport")

// to configure this script just run it once. All the zones and outputs will
// be logged to the console before crashing
AlarmZones = {
    AriaEvoX: {
        Id: '1601f42f1178d925f9f368be5fb3ebb294e1',
        OutputId: '1701f42f1178d925f9f368be5fb3ebb294e1',
        MaxVolume: 40,
    },
    KefQ150: {
        Id: '160159f398ff576aff46bb2dedfdff98f359',
        OutputId: '170159f398ff576aff46bb2dedfdff98f359',
        MaxVolume: 5,
    },
    KefReference1: {
        Id: '16019cf098ffdc43849e1ec09055ff98f09c',
        OutputId: '17019cf098ffdc43849e1ec09055ff98f09c',
        MaxVolume: 40, // meaningless I think? Controlled by the C49
    },
    PolkR200: {
        Id: '160159f398ff16ce633ecfbf6a86ff98f359',
        OutputId: '170159f398ff16ce633ecfbf6a86ff98f359',
        MaxVolume: 40,
    },
}
var IS_PROD = !!process.env.WAKE_ME_UP
var AlarmZone = IS_PROD ? AlarmZones.AriaEvoX : AlarmZones.KefQ150

// -----------------------------------------------------------
//#region roon stuff
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
    required_services: [RoonApiTransport],
    provided_services: [svc_status]
});

svc_status.set_status("🙏 hope you wake up 🙏", false);

roon.start_discovery();
//#endregion roon stuff
// -----------------------------------------------------------

// -----------------------------------------------------------
//#region async wrappers
// wrap all the roon api functions in to an async/await thingy

function convenience_switch(output, opts) {
    return new Promise((resolve) => {
        transport.convenience_switch(output, opts, (err) => {
            resolve(err)
        })
    });
}

function change_volume(output, how, value) {
    return new Promise((resolve) => {
        transport.change_volume(output, how, value, (err) => {
            resolve(err)
        })
    });
}

function control(zone, control) {
    return new Promise((resolve) => {
        transport.control(zone, control, (err) => {
            resolve(err)
        })
    });
}

function timer(seconds) {
    return new Promise((resolve) => {
        setTimeout(() => { resolve(true) }, seconds * 1000)
    })
}

//
// wrap all the roon api functions in to an async/await thingy
//#endregion async wrappers
// -----------------------------------------------------------

async function start_alarm() {
    await convenience_switch(AlarmZone.OutputId);
    await change_volume(AlarmZone.OutputId, 'absolute', 0);
    await control(AlarmZone.Id, 'play');
    for (let i = 0; i <= AlarmZone.MaxVolume; i++) {
        let min_time_between_steps = timer(0.5)
        let increase_volume = change_volume(AlarmZone.OutputId, 'absolute', i);
        await Promise.all([increase_volume, min_time_between_steps])
    }
}
