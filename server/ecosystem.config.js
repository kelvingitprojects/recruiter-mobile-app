module.exports = {
  apps: [{
    name: "swipe-server",
    script: "./index.js",
    instances: 1,
    exec_mode: "fork",
    watch: true,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    merge_logs: true
  }]
}
