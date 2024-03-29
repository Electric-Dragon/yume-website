require('dotenv').config();

const neo4j = require('neo4j-driver');
// import { isInt, isDate, isDateTime, isTime, isLocalDateTime, isLocalTime, isDuration } from 'neo4j-driver'
    
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

module.exports.readChapter = async function readChapter({seriesid, userid}) {

    const session = driver.session();
    let response;

    try {

        const query = `
            MATCH (u:User {uid:"${userid}"})
            MATCH (s:Series {id:"${seriesid}"})
            MERGE (u)-[r:READS]->(s)`;

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

module.exports.getRecommendations = async function getRecommendations({userid}) {

    const session = driver.session();
    let response;

    try {
        
        const query = `
            MATCH (u:User)-[:READS]->(s:Series)
            <-[:READS]-(u2:User)-[:READS]->(s2:Series)-[:GENRE]->(:Genre)<-[:GENRE]-(s)
            WHERE u.uid = "${userid}" and NOT ( (u)-[:READS]->(s2) )
            return DISTINCT s2.id
            limit 5
        `

        let result = await session.readTransaction(tx => tx.run(query));

        let seriesIds = result.records.map(record => valueToNativeType(record.get('s2.id')));

        response = {seriesIds: seriesIds};

    } catch (error) {

        console.log(error);
        response = {error: error};  
           
    } finally {
        
        await session.close();
        return response;
    
    }

}

function toNativeTypes(properties) {
    return Object.fromEntries(Object.keys(properties).map((key) => {
      let value = valueToNativeType(properties[key])
  
      return [ key, value ]
    }))
  }
  
  
function valueToNativeType(value) {
    if ( Array.isArray(value) ) {
        value = value.map(innerValue => valueToNativeType(innerValue))
    }
    else if ( neo4j.isInt(value) ) {
        value = value.toNumber()
    }
    else if (
        neo4j.isDate(value) ||
        neo4j.isDateTime(value) ||
        neo4j.isTime(value) ||
        neo4j.isLocalDateTime(value) ||
        neo4j.isLocalTime(value) ||
        neo4j.isDuration(value)
    ) {
        value = value.toString()
    }
    else if (typeof value === 'object' && value !== undefined  && value !== null) {
        value = toNativeTypes(value)
    }

    return value
}