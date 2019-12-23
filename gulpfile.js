require('@ministryofjustice/module-alias/register')

const gulp = require('gulp')

const {
  cssClean: buildCssClean,
  css: buildCss,
  cssWatch: buildCssWatch
} = require('./build/gulp/build')

const {
  specifications: transformSpecifications,
  templates: transformTemplates
} = require('./build/gulp/transform')

gulp
  .task('build:css:clean', buildCssClean)

gulp
  .task('build:css', gulp.series('build:css:clean', buildCss))

gulp
  .task('build:css:watch', gulp.series('build:css', buildCssWatch))

gulp
  .task('build:clean', gulp.series('build:css:clean'))

gulp
  .task('build', gulp.series('build:css'))

gulp
  .task('build:watch', gulp.parallel('build:css:watch'))

gulp
  .task('transform:specifications', transformSpecifications)

gulp
  .task('transform:templates', transformTemplates)

gulp
  .task('transform', gulp.series('transform:templates', 'transform:specifications'))
