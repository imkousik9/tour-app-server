const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(
      res.status(403).json({
        status: 'Forbidden',
        message: 'You do not have permission to perform this action'
      })
    );
  }

  next();
};

module.exports = isAdmin;
