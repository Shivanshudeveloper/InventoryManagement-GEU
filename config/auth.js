module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/')
    },

    ensureAuthenticatedFaculty: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/faculty')
    }
}