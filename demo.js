import { MongoClient } from "mongodb";

async function main(){

    const uri = "mongodb+srv://tarunjoshi3010:Josh3027$$$@cluster0.vyn18.mongodb.net/sample_restaurants?retryWrites=true&w=majority";

    const client = new MongoClient(uri);


    try{
        await client.connect();
      //  await  listDatabase(client);
        // await createListing(client, {
        //     name: "Lovely loft",
        //     summary : "A lovely lof in chicago",
        //     bedrooms : 1,
        //     bathrooms: 1
        // } )

        // await createMultipleListing(client, [ {
        //     name: "Lovely House One",
        //     summary : "A lovely lof in chicago",
        //     property_type : "House",
        //     bathrooms: 1
        // } , {
        //     name: "Lovely loft Two",
        //     summary : "A lovely lof in NewJersey",
        //     last_review : new Date(),
        //     bathrooms: 2
        // } , {
        //     name: "Lovely loft Three",
        //     summary : "A lovely lof in Florids",
        //     bedrooms : 3
        // } ])

        //await findOneListingByName(client, "Lovely loft Two")

        // await findListingsByWithMinimumBedroomBathRoomAndRecentreveiews(client, {
        //     minimumNumberOfBedrooms: 4,
        //     minimumNumberOfBathrooms: 2,
        //     maximumNumberOfReviews : 5
        // })

        // await updateOneListingByName(client, "Updated Lovely loft Two", {
        //     name: "2nd Updated Lovely loft Two", 
        //     summary : "A lovely lof in Michigan",
        //     bedrooms : 2
        // })


        // await upsertListingByName(client, "2nd Updated Lovely loft Two", {
        //     name: "3rd Updated Lovely loft Two", 
        //     summary : "A lovely lof in Michigan",
        //     bedrooms : 2
        // })

       // await updateAllListingToHavePropertyType(client);

       //await deleteListingByName(client, "3rd Updated Lovely loft Two")


       await deleteAllListingsScrapedAfterDate(client, new Date("2019-02-15"))
    } catch(e){
        console.error(e)
    } finally{
        await client.close();
    }

   
}

main().catch(console.error)

async function listDatabase(client){
    const databaseList  = await client.db().admin().listDatabases();

    databaseList.databases.forEach(element => {
        console.log(element.name );
    });
}


async function createListing(client, newListing){
    try{
       const result = await  client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
       console.log(`New listing created with id: ${result.insertedId}`)
    } catch(e){
        console.error(e)
    }
}

async function createMultipleListing(client, newListings){
    try{
       const result = await  client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings);
       console.log(`Total listing created count: ${result.insertedCount}`)
       console.log('with ids:', result.insertedIds)
    } catch(e){
        console.error(e)
    }
}

async function findOneListingByName(client, nameOfListing){
    try{
        const result = await  client.db("sample_airbnb").collection("listingsAndReviews").findOne({name : nameOfListing});

        if(result) {
            console.log(`Found listings with listing name: ${nameOfListing} as below:`)
            console.log(result)
        } else {
            console.log(`No listings found with listing name: ${nameOfListing} `)
        }
        
     } catch(e){
        console.error(e)
     }
}

async function findListingsByWithMinimumBedroomBathRoomAndRecentreveiews(client, {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfReviews = Number.MAX_SAFE_INTEGER
} = {}){
    try{
        let query = {
           bedrooms: {$gte: minimumNumberOfBedrooms} ,
           bathrooms: {$gte : minimumNumberOfBathrooms}
        }
        const cursor = await  client.db("sample_airbnb").collection("listingsAndReviews")
                                .find(query)
                                .sort({last_review: -1})
                                .limit(maximumNumberOfReviews);

        const results = await cursor.toArray();


        // Print the results
        if (results.length > 0) {
            console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms:`);
            results.forEach((result, i) => {
                const date = new Date(result.last_review).toDateString();

                console.log();
                console.log(`${i + 1}. name: ${result.name}`);
                console.log(`   _id: ${result._id}`);
                console.log(`   bedrooms: ${result.bedrooms}`);
                console.log(`   bathrooms: ${result.bathrooms}`);
                console.log(`   most recent review date: ${date}`);
            });
        } else {
            console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
        }
        
     } catch(e){
        console.error(e)
     }
}

async function updateOneListingByName(client , nameOfListing, updatedListing){
   
         try{
            const result = await  client.db("sample_airbnb").collection("listingsAndReviews").updateOne({name : nameOfListing},
                {$set : updatedListing});
       
            console.log(`Matched Records count: ${result.matchedCount}`)
            console.log(`Updated Records count: ${result.modifiedCount}`)
            console.log(result);
         } catch(e){
            console.error(e)
         }
}


async function upsertListingByName(client , nameOfListing, updatedListing){
   
    try{
       const result = await  client.db("sample_airbnb").collection("listingsAndReviews").updateMany({name : nameOfListing},
           {$set : updatedListing}, {upsert: true});
  
           console.log(result);

       if(result.upsertedCount > 0) {
        console.log(`Inserted Record with id: ${result.upsertedId}`)
       } else {
        console.log(`Matched Records count: ${result.matchedCount}`)
        console.log(`Updated Records count: ${result.modifiedCount}`)
       
       }
    } catch(e){
       console.error(e)
    }
}


async function updateAllListingToHavePropertyType(client , nameOfListing, updatedListing){
   
    try{
       const result = await  client.db("sample_airbnb").collection("listingsAndReviews").updateMany(
           {notes : {$exists: true}},
           {$set : {notes: "new notes"}}
       );
       
      console.log(result.matchedCount);
      console.log(result.modifiedCount);
    } catch(e){
       console.error(e)
    }
}

async function deleteListingByName(client , nameOfListing){
   
    try{
       const result = await  client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({name: nameOfListing});
       
      console.log(`Deleted record count ${result.deletedCount}`);
    } catch(e){
       console.error(e)
    }
}


async function deleteAllListingsScrapedAfterDate(client , date){
   
    try{
       const result = await  client.db("sample_airbnb").collection("listingsAndReviews").deleteMany(
           {last_scraped: {$lt: date}});
       
      console.log(`Deleted records count ${result.deletedCount}`);
    } catch(e){
       console.error(e)
    }
}

