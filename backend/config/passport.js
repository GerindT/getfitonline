const User = require("../models/User")
const passport = require("passport")
const googleStrategy = require("passport-google-oauth20").Strategy

passport.serializeUser((user, cb) => {
  cb(null, user._id)
})
passport.deserializeUser(async (id, cb) => {
  try {
    const user = await User.findById(id)
    cb(null, user)
  } catch (err) {
    cb(err)
  }
})

passport.use(User.createStrategy())

passport.use(
  new googleStrategy(
    {
      clientID: "511722784813-2vb8plevm35p9ru7om52ia7uo2lkm9p8.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/auth/google/callback",
    },
    async (_, __, { id, emails, photos }, done) => {
      const user = await User.findOne({ googleID: id })

      if (!user) {
        const newUser = await User.create({
          googleID: id,
          email: emails[0].value,
          image: photos[0].value,
        })
        done(null, newUser)
        return
      }

      done(null, user)
    }
  )
)

module.exports = passport
