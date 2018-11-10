const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);
const shortid = require("shortid");
const CronJob = require("cron").CronJob;
class Scheduler {
  constructor() {
    db.defaults({ products: [] }).write();
    this.schedules = {};
  }
  async loadSchedule(jobRunner) {
    this.jobRunner = jobRunner;
    const scheduleItems = this.listSchedule();
    scheduleItems.forEach(async (schedule) => {
      this.planToSchedule(jobRunner, schedule);
    });
  }
  planToSchedule(jobRunner, schedule) {
    const job = new CronJob(
      new Date(schedule.datetime),
      async (completed) => {
        const now = new Date().toLocaleDateString();
        console.warn(
          `start the schedule job ${schedule.url}/${
            schedule.datetime
          } at ${new Date()}`
        );
        await jobRunner.execute(schedule);
        completed();
      },
      () => {},
      true
    );
    //const job = jobScheduler.scheduleJob(schedule.datetime, async () => {});
    this.schedules[schedule.datetime] = job;
    //console.warn("plat to schedule done", this.schedules);
  }
  addToSchedule(schedule) {
    this.planToSchedule(this.jobRunner, schedule);
    return db
      .get("products")
      .push({
        datetime: schedule.datetime,
        url: schedule.url,
        specname: schedule.specname,
        id: shortid.generate()
      })
      .write();
  }

  removeSchedule({ id }) {
    const schedule = db
      .get("products")
      .find({ id: id })
      .value();
    const job = this.schedules[schedule.datetime];
    if (job) {
      job.stop();
    }
    return db
      .get("products")
      .remove({ id: id })
      .write();
  }
  listSchedule() {
    return db
      .get("products")
      .sortBy("datetime")
      .value();
  }
}

module.exports = Scheduler;
