module.exports = {
  apps: [
    {
      name: 'anjelaweb',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/anjelaweb',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/anjelaweb-error.log',
      out_file: '/var/log/pm2/anjelaweb-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
  ],
};
