import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    name: String,
    author: String,
    slug: String,
    img: String,
    room: {
      type: String,
      enum: ["bedroom", "living-room", "corridor", "carriage-room"]
    },
    place: {
      type: String,
      enum: [
        "wardrobe",
        "chest-of-drawers",
        "sofa",
        "tv-cupboard",
        "long-cupboard",
        "bookcase",
        "desk"
      ]
    },
    rates: [Number],
    series: {
      type: String,
      default: ""
    },
    tags: [
      {
        type: String,
        enum: [
          "crime",
          "thriller",
          "food",
          "school",
          "youth",
          "detective",
          "science",
          "fantasy",
          "jokes",
          "psychological",
          "kids",
          "series",
          "beauty",
          "sci-fi",
          "horror",
          "adventure",
          "fact",
          "biography",
          "sport"
        ]
      }
    ],
    description: String
  },
  {
    timestamps: true
  }
);

bookSchema.index({ name: "text", description: "text", author: "text" });

export default mongoose.model("Book", bookSchema);
