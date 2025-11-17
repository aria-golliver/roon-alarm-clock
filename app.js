async function start_alarm() {
    await convenience_switch(AlarmZone.Outputs)
    await change_volume(AlarmZone.Outputs, 'absolute', 0)
    await control(AlarmZone.Id, 'play')
    for (let i = AlarmZone.VolumeRange[0]; i <= AlarmZone.VolumeRange[1]; i++) {
        let min_time_between_steps = timer(VolumeIncreaseDuration / (AlarmZone.VolumeRange[1] - AlarmZone.VolumeRange[0]))
            .then(() => console.debug(`timer fired ${i}`))
        let increase_volume = change_volume(AlarmZone.Outputs, 'absolute', i)
            .then(() => console.debug(`increase volume fired ${i}`))
        await Promise.all([increase_volume, min_time_between_steps])
    }
    if (!IS_PROD) {
        await change_volume(AlarmZone.Outputs, 'absolute', 0)
        await control(AlarmZone.Id, 'stop')
    }
    process.exit()
}

// to configure this script just run it once. All the zones and outputs will
// be logged to the console before crashing
//
// this technically supports multiple outputs in each zone
// but I don't have any of those at home, so idk what that means
// or if it works...
AlarmZones = {
    AriaEvoX: {
        Id: '1601f42f1178d925f9f368be5fb3ebb294e1',
        Outputs: ['1701f42f1178d925f9f368be5fb3ebb294e1'],
        VolumeRange: [0, 40],
    },
    KefQ150: {
        Id: '160159f398ff576aff46bb2dedfdff98f359',
        Outputs: ['170159f398ff576aff46bb2dedfdff98f359'],
        VolumeRange: [0, 5],
    },
    KefReference1: {
        Id: '16019cf098ffdc43849e1ec09055ff98f09c',
        Outputs: ['17019cf098ffdc43849e1ec09055ff98f09c'],
        VolumeRange: [0, 40], // meaningless I think? Controlled by the C49
    },
    PolkR200: {
        Id: '160159f398ff16ce633ecfbf6a86ff98f359',
        Outputs: ['170159f398ff16ce633ecfbf6a86ff98f359'],
        VolumeRange: [0, 15],
    },
}

let IS_PROD = !!process.env.WAKE_ME_UP
let AlarmZone = IS_PROD ? AlarmZones.AriaEvoX : AlarmZones.PolkR200
// how long to take to go from 0 to max volume, in seconds
// kinda fuzzy - depending on how long it takes roon to adjust the volume of your device it might be (much) longer
let VolumeIncreaseDuration = IS_PROD ? 30 : 1

// -----------------------------------------------------------
//#region roon stuff
let RoonApi = require("node-roon-api")
let RoonApiStatus = require("node-roon-api-status")
let RoonApiTransport = require("node-roon-api-transport")

var transport;
let roon = new RoonApi({
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
                    let outputs = zone['outputs'].map(output => {
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

function convenience_switch(outputs, opts) {
    return Promise.all(outputs.map((output) => {
        return new Promise((resolve) => {
            transport.convenience_switch(output, opts, (err) => {
                resolve(err)
            })
        })
    }))
}

function change_volume(outputs, how, value) {
    return Promise.all(outputs.map((output) => {
        return new Promise((resolve) => {
            transport.change_volume(output, how, value, (err) => {
                resolve(err)
            })
        })
    }))
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
