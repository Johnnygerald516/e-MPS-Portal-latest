module.exports = {
    apps: [
      {
        name: "nextapp",                // Name in PM2 list
        cwd: "C:/path/to/your/nextjs-project", // 👈 Absolute path to your project
        script: "npm",
        args: "start",
        env: {
          NODE_ENV: "production",       // Run in production mode
          PORT: 3000                    // Change to 80/8080 if you like
        },
        watch: false,                   // Don't watch files in production
        autorestart: true,              // Restart if app crashes
        max_memory_restart: "500M",     // Restart if memory > 500MB
        error_file: "C:/pm2-logs/nextapp-error.log", // Custom log paths
        out_file: "C:/pm2-logs/nextapp-out.log",
        time: true                      // Add timestamp to logs
      }
    ]
  };
  