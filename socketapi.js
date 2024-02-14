const usermodel = require("./routes/users")
const messagemodel = require("./routes/message")
const groupmodel = require("./routes/group");


const io = require("socket.io")();
const socketapi = {
    io: io
};

// Add your socket.io logic here!
io.on("connection", function (socket) {
    console.log("A user connected");

    // console.log(socket.id)

    socket.on("join-server", async userdets => {
        // console.log(userdets)

        const currentuser = await usermodel.findOne({
            username: userdets.username
        })

        const allgroups = await groupmodel.find({
            users: {
                $in: [
                    currentuser._id
                ]
            }
        })

        allgroups.forEach(group => {
            socket.emit("group-joined", group)
        })



        await usermodel.findOneAndUpdate({
            username: userdets.username,
        }, {
            socketId: socket.id
        })

        const onlineusers = await usermodel.find({
            socketId: {
                $nin: ["", socket.id]
            }
        })

        onlineusers.forEach(onlineuser => {
            socket.emit("new-user-join", {
                profileimg: onlineuser.profileimg,
                username: onlineuser.username,
            })
        })

        socket.broadcast.emit("new-user-join", userdets)
    })

    socket.on("disconnect", async () => {
        await usermodel.findOneAndUpdate({
            socketId: socket.id
        }, {
            socketId: ""
        })

    })


    socket.on("private-message", async messageobject => {
        await messagemodel.create({
            msg: messageobject.message,
            reciver: messageobject.reciver,
            sender: messageobject.sender
        });

        const isGroup = await groupmodel.exists({ name: messageobject.reciver });

        if (isGroup) {
            const group = await groupmodel.findOne({
                name: messageobject.reciver
            }).populate('users');

            group.users.forEach(user => {
                socket.to(user.socketId).emit("group-message", messageobject);
            });
        } else {
            const reciver = await usermodel.findOne({
                username: messageobject.reciver
            });

            if (reciver) {
                socket.to(reciver.socketId).emit("private-message", messageobject);
            }
        }
    });


    

    socket.on('fetch-conversation', async conversationdets => {

        const isuser = await usermodel.findOne({
            username: conversationdets.reciver
        })

        if (isuser) {
            const allmessages = await messagemodel.find({
                $or: [
                    {
                        sender: conversationdets.sender,
                        reciver: conversationdets.reciver
                    },
                    {
                        sender: conversationdets.reciver,
                        reciver: conversationdets.sender
                    }
                ]
            })

            socket.emit("send-conversation", allmessages)

        }
        else {
            const allmessages = await messagemodel.find({
                reciver: conversationdets.reciver
            })

            socket.emit("send-conversation", allmessages)

        }




    })


    socket.on('create-new-group', async groupdets => {

        if(!groupdets.profileimg){
             groupdets.profileimg = "https://www.criconet.com/upload/photos/d-group.jpg"
        }
        const newgroup = await groupmodel.create({
            name: groupdets.groupname,
            profileimg:groupdets.profileimg
        });
        const createruser = await usermodel.findOne({
            username: groupdets.sender
        })

        newgroup.users.push(createruser._id)

        await newgroup.save()


        socket.emit('group-created', newgroup)
    })

    socket.on('join-group', async joingrpdets => {
        const group = await groupmodel.findOne({
            name: joingrpdets.groupname
        })
        const curentuser = await usermodel.findOne({
            username: joingrpdets.sender
        })
        group.users.push(curentuser._id)
        await group.save()

        console.log(group)
        socket.emit("group-joined", {
            profileimg: group.profileimg,
            name: group.name,
        })
    })



});
// end of socket.io logic



module.exports = socketapi;
