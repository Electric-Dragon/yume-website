require('dotenv').config();

const neo4j = require('neo4j-driver');
    
const uri = process.env.DB_URI;
const user = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
driver.verifyConnectivity().then(() => {
    console.log('Connected to Neo4J');
}).catch(err => {
    console.log(err);
});

module.exports.createUserNode = async function createUserNode(uid, username) {

    const session = driver.session();
    let response;

    try {

        const query = `
            MERGE (u:User {uid: '${uid}'})
            ON CREATE SET u.username = '${username}', u.creator = false`;

        await session.writeTransaction(tx => tx.run(query));

        response = {success: true};
        
    } catch (error) {

        console.log(error);
        response = {error: true};  
           
    } finally {
    
        await session.close();
        return response;

    }

}

module.exports.createSeriesNode = async function createSeriesNode({id,genre1,genre2},{title, cover, novel, adaptation, status, mature, creator}) {

    const session = driver.session();
    let response;

    let adaptationQuery = (adaptation) ? `WITH s
                                          MATCH (og:Series {id: '${adaptation}'})
                                          MERGE (s)-[:ADAPTS]->(og)` : '';

    try {

        const query = `
            MATCH (u:User {uid: '${creator}'})
            MERGE (s:Series {id: '${id}'})
            ON CREATE SET s.title='${title}'
            MERGE (g1:Genre {name: '${genre1}'})
            MERGE (g2:Genre {name: '${genre2}'})
            MERGE (s)-[:GENRE]->(g1)
            MERGE (s)-[:GENRE]->(g2)
            MERGE (u)-[:CREATED]->(s)
            ${adaptationQuery}`;

        await session.writeTransaction(tx => tx.run(query));

        response = {success: true};
        
    } catch (error) {

        console.log(error);
        response = {error: 'An error occurred'};  
           
    } finally {
    
        await session.close();
        return response;

    }

}

module.exports.followSeries = async function followSeries({seriesid, userid}) {

    const session = driver.session();
    let response;

    try {

        const query = `
            MATCH (u:User {uid: '${userid}'})
            MATCH (s:Series {id: '${seriesid}'})
            MERGE (u)-[r:FOLLOWS]->(s)`;

        await session.writeTransaction(tx => tx.run(query));

        response = {success: true};
        
    } catch (error) {

        console.log(error);
        response = {error: error};  
           
    } finally {
    
        await session.close();
        return response;

    }

}

module.exports.unfollowSeries = async function unfollowSeries({seriesid, userid}) {

    const session = driver.session();
    let response;

    try {

        const query = `
            MATCH (u:User {uid: '${userid}'})-[r:FOLLOWS]->(s:Series {id: '${seriesid}'})
            DELETE r`;

        await session.writeTransaction(tx => tx.run(query));

        response = {success: true};
        
    } catch (error) {

        console.log(error);
        response = {error: error};  
           
    } finally {
    
        await session.close();
        return response;

    }

}