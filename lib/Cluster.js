const cluster = require('cluster')
const os = require('os')

module.exports = class {

  constructor({
    workerFunction,
    workersCount = os.cpus().length,
    log = console.log
  }) {
    this.workerFunction = workerFunction
    this.workersCount = workersCount
    this.log = log
    this.isRunning = false
  }

  start() {
    if (cluster.isMaster) {
      cluster.on('exit', (worker, code, signal) => {
        if (this.isRunning && !worker.exitedAfterDisconnect) {
          this.log(`Respawning worker '${worker.id}'`)
          cluster.fork()
        }
      })
      for (let i = 0; i < this.workersCount; i++) {
        cluster.fork()
      }
    } else {
      this.workerFunction(`Worker '${cluster.worker.id}' has been started`)
    }
  }

  shutdown() {
    this.isRunning = false
    for (const id in cluster.workers) {
      const worker = cluster.workers[id]
      this.log(`Killing ${worker.id}`)
      worker.process.kill()
    }
  }
}
