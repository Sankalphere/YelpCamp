//Require mongoose and other dependencies for model creation
const mongoose = require('mongoose');
//We do as we need to call schema multiple times
const Schema = mongoose.Schema;
//Require review model in order to delete
const Review = require('./review.js');

//Creating our own image Schema
const ImageSchema = new Schema({
    url: String,
    filename: String
});

//Creating virtual on image Schema
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200,h_200');
});

// to allow virtuals be passed when converted to Json
const opts = {
    toJSON: {
        virtuals: true
    }
};

//Creating our Campground Model
const campgroundSchema = new Schema({
    title: {
        type: String
    },
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: {
        type: Number
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts);

//Adding Virtual in CampgroundSchema for Map Box clusters
campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong>
    <a href='/campgrounds/${this.id}'>${this.title}</a>
    </strong>
    <p>${this.description.substring(0, 20)}...</p>`;
});

//Adding mongoose middleware in order to delete all related reviews to the campground  
//Here document means our deleted campground (with all it's properties name, image, price as well as reviews array)
campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        //Here we say that delete all review in Review collection where id is in doc.reviews array
        // (basically all reviews whose id in campground reviews array)
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//Create the model using the Schema
//We use capital letter because it is similar to a class construtor
const Campground = mongoose.model('Campground', campgroundSchema);

//Now export the model so it can be used (Exported in form of an object)
module.exports = Campground;