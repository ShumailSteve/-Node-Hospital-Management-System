const jwt = require('jsonwebtoken');

const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn:
    '7 days' })

    console.log({token});


    const data = jwt.verify(token, 'thisismynewcourse')
    console.log({data});
    // data._id contains the user id of the user that owns this token