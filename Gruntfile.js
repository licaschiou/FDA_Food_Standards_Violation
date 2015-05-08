module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      css: {
        files: 'sass/style.scss',
        tasks: ['sass'],
        options: {
        },
      }
    },


    sass: {                             
      dist: {                           
        options: {                       
          style: 'expanded',
          require: 'susy'
        },
        files: {                         
          'css/style.css': 'sass/style.scss'
        }
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  // Default task(s).
  grunt.registerTask('default', ['watch']);

};