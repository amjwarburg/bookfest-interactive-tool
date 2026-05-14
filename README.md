# SHROPSHIRE BOOKFEST WEB APPLICATION

#### Video Demo:

#### Description:

**About the Project**
This is a web app which will hopefully soon be deployed for 'Shropshire Bookfest', a local charity which promotes children's literacy through fostering a love of reading. The app is designed for the children who take part in Bookfest projects, of which there are two and they happen on alternate years. The first project comprises the 'Big Book Award' and 'Picture Book Award'. For these projects children from Key Stage 2 (Big Book Award) and Key Stage 1 (Picture Book Award) vote on their favourite books and whittle a longlist down to a shortlist of 6. Then, there is an event held in a local theatre where the winner of the Big Book Award is announced, whilst Picture Book Award has a more low-key video presentation format.

The app is meant to complement these projects and not to take their place. For this reason, voting will still be done in person in the schools and the app is really designed to get the children excited to read the books. Because it aims to encourage reading, there will not be a smartphone application version of this web app, nor will the website be specifically designed for phone usage.

**Files**
Databases:
bookfest.db - The schema of this database file is quite complex because it holds both information about users as well as much book metadata.

- the books table holds an id for each book, its title, author, publication year and recommended reading age. It also holds a text input for an associated cover image path as well as a column for a description and an about author column where can be stored information pertaining to the book.
- the book_award_years table has its id as a primary key and the year in which the book award took place. It is used to filter the book award entries into their various years.
- the book_award_entries table holds records of which books made it onto the shortlist and is associated with the book_award_years table so that it can itemise when a book was shortlisted.
- the users table holds the user's id as the primary key as well as their first name, last name, password hash, email and a boolean to determine whether they have admin permissions or not.
- the moods and genres tables hold the names of the mood and genre that can be associated with each book respectively. The mood table also associated an emoji with each mood for more visual interest.
- the book_moods and book_genres tables allow each book to be associated with one of the moods and genres listed in their respective tables.
- the user_books table links the user data to the book data and allows for users to mark a book as read/not read and also to post a review for a book which is displayed in the reviews section of the web application.

Middleware:
auth.js
csrf.js
multer.js

**Design Choices**
There were many design choices which played a large role in how the project now appears. These impacted both the frontend and the backend. For a start,

TODO
I still have many things that I would like to implement before the web app goes live. Among these are:

- A quotes page which has a list of associated quotes from the books and which the children can 'heart'
- Book-O-Meter review sliders where kids can rate a book on various sliding scales (e.g. how fast did you read this? - Snail speed to rocket speed, how much did you laugh - no smiles - belly ache)
- 'Take me on an adventure' page which links to a random book that the user hasn't yet marked as read
- Of course, I also still need to work out deployment of the app
- Incorporate many more books in the book database
