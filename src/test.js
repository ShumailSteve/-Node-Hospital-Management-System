// const jwt = require('jsonwebtoken');

// const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn:
//     '7 days' })

//     console.log({token});


//     const data = jwt.verify(token, 'thisismynewcourse')
//     console.log({data});

const bcrypt = require('bcryptjs')

bcrypt.compare('$2a$08$0Xze.R8ClxbmZp9qKvWzPe.GKx.2PnemnquDUBdqUp1D9dFaHtvbO', "1234567").then( (doc) => {
    console.log(doc);
})
