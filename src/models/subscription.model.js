import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({

subscriber: {
    type: mongoose.Schema.Types.ObjectId, //one who is sunscribing
    ref: "User",
},

channel: {
    type: Schema.Types.ObjectId, //one to whom 'subscirber' is subscribing
    ref:"user"
}
}, {timestamps: true}
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema)
