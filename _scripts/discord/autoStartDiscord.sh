#!/bin/bash
#
# Autostart the bot on restart with this script
#
#
sleep 15
cd "/home/$USER/test-qrl-tipbot"
screen -Sdm DiscordBot npm run DiscordBot
#screen -Sdm DiscordBot nodejs _scripts/discord/index.js
#nodejs index.js