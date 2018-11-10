const carlo = require("carlo");
const shopeeController = require("./src/shopeeController");
const { rpc, rpc_process } = require("carlo/rpc");

(async () => {
  // Launch the browser.
  const app = await carlo.launch();

  // Terminate Node.js process on app window closing.
  app.on("exit", () => process.exit());

  // Tell carlo where your web files are located.
  app.serveFolder(__dirname + "/www");

  // Expose 'env' function in the web environment.
  /*await app.exposeFunction("create", (_) =>
    rpc_process.spawn("./src/shopeeController.js")
  );*/
  // Navigate to the main page of your app.

  await app.load("index.html", rpc.handle(shopeeController));
  //rpc_process.init(() => rpc.handle(shopeeController.getEventEmitter()));
})();
