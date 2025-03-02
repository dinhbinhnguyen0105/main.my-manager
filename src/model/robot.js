// robot.js

const initRobotModel = () => {
    return {
        interact: {
            likeAndComment: {
                isSelected: false,
                friend: {
                    isSelected: false,
                    isOnline: false,
                    like: {
                        isSelected: false,
                        value: [], //count ["like", "love", "haha", "wow", "sad", "angry"]
                    },
                    comment: {
                        isSelected: false,
                        value: [],
                    },
                    poke: {
                        isSelected: false,
                        value: 0,
                    },
                    rePoke: {
                        isSelected: false,
                        value: 0,
                    },
                },
                newsFeed: {
                    isSelected: false,
                    value: 0,
                    like: {
                        isSelected: false,
                        value: [], //count ["like", "love", "haha", "wow", "sad", "angry"]
                    },
                    share: {
                        isSelected: false,
                        value: 0,
                    },
                    comment: {
                        isSelected: false,
                        value: [],
                    },
                },
                watch: {
                    isSelected: false,
                    value: 0,
                    like: {
                        isSelected: false,
                        value: [], //count ["like", "love", "haha", "wow", "sad", "angry"]
                    },
                    share: {
                        isSelected: false,
                        value: 0,
                    },
                    comment: {
                        isSelected: false,
                        value: [],
                    },
                },
                group: {
                    isSelected: false,
                    value: 0,
                    like: {
                        isSelected: false,
                        value: [], //count ["like", "love", "haha", "wow", "sad", "angry"]
                    },
                    share: {
                        isSelected: false,
                        value: 0,
                    },
                    comment: {
                        isSelected: false,
                        value: [],
                    },
                },
                page: {
                    isSelected: false,
                    value: 0,
                    like: {
                        isSelected: false,
                        value: [], //count ["like", "love", "haha", "wow", "sad", "angry"]
                    },
                    share: {
                        isSelected: false,
                        value: 0,
                    },
                    comment: {
                        isSelected: false,
                        value: [],
                    },
                    invite: {
                        isSelected: false,
                        value: 0,
                        url: "",
                    }
                },
                marketplace: {
                    isSelected: false,
                    value: 0,
                },
                notification: {
                    isSelected: false,
                    value: 0,
                },
                search: {
                    isSelected: false,
                    value: 0,
                },
            },
        },
        settings: {
            isMobile: false,
            thread: 1,
            proxy: "",
        },
    }
}


module.exports = initRobotModel;