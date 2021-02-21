
// script will update the status of the bot. 
/*
Rotate through various update information
- Curent QRL/USD Price
- Curent QRL/BTC Price
- Curent Wallet Balance


*/

let hasRun = false;
setInterval(() => hasRun = false, 60000);
async update() {
  if (hasRun) return;
  hasRun = true;
  // your code
}
