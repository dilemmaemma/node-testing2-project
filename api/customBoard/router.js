const router = require('express').Router()
const { confirmation } = require('./middleware')

router.get('/test', (req, res) => {
    res.json({message: 'Custom board test route is working'})
})
router.get('/board', (req, res, next) => {
    const { width, height, bombs } = req.body

    try {
        res.json({
            result: {
                board_width: width || 'Board is not yet created',
                board_height: height || 'Board is not yet created',
                board_bombs: bombs || 'Board is not yet created',
            }
        })
    } catch (error) {
        next({ status: 404, message: 'Custom board could not be found', error: error })
    }
})

router.post('/board', confirmation, async (req, res, next) => {
    try {
        const { width, height, bombs } = req.body
        res.status(201).json({
            message: 'Board created',
            result: {
                board_width: width,
                board_height: height,
                board_bombs: bombs
            }
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router