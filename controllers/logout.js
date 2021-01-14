module.exports = (req, res) => {
    req.session.destroy(() => {
        req.flash('success', 'Successfully Log Out.');
        res.redirect('/')
    })
}