A simple roon alarm clock app - all this does is hit play on a hard-coded roon zone.

Important: There must be something in the play queue for it to actually work :P

[./setup.sh](./setup.sh) will help you install everything and give an example crontab.

[official roon api / docs here](https://github.com/RoonLabs/node-roon-api)

I wrapped the roon functions I used in promises because it makes it way easier to reason about.
It's an alarm clock, it's not that serious anyway.
How long did JS programmers spend suffering with callbacks-in-callbacks-in-callbacks?