// Script to help fix MongoDB connection issues
require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔧 MongoDB Connection Fix Script\n');

// Check connection string
const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
}

console.log('📋 Current Connection String Analysis:');
console.log(`   Format: ${uri.includes('mongodb+srv') ? 'SRV (Cloud)' : 'Standard'}`);
console.log(`   Contains username: ${uri.includes('://') && uri.split('://')[1].includes(':') ? '✅' : '❌'}`);
console.log(`   Contains password: ${uri.includes('@') ? '✅' : '❌'}`);
console.log(`   Contains database: ${uri.includes('/') && uri.split('/').length > 1 && !uri.split('/')[1].includes('?') ? '❌' : '✅'}\n`);

// Extract cluster name
const clusterMatch = uri.match(/@([\w-]+\.mongodb\.net)/);
const clusterName = clusterMatch ? clusterMatch[1] : 'not found';
console.log(`   Cluster: ${clusterName}\n`);

// Try different connection methods
console.log('🔍 Testing Connection Methods...\n');

// Method 1: Standard SRV connection
async function testConnection1() {
    console.log('Method 1: Standard SRV Connection');
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log('   ✅ SUCCESS!\n');
        await mongoose.connection.close();
        return true;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.message.substring(0, 80)}...\n`);
        return false;
    }
}

// Method 2: With explicit server selection
async function testConnection2() {
    console.log('Method 2: With DNS Cache Clear');
    try {
        // Clear DNS cache
        const dns = require('dns');
        dns.setDefaultResultOrder('ipv4first');
        
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            directConnection: false,
        });
        console.log('   ✅ SUCCESS!\n');
        await mongoose.connection.close();
        return true;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.message.substring(0, 80)}...\n`);
        return false;
    }
}

// Method 3: Try with direct connection (if SRV fails)
async function testConnection3() {
    console.log('Method 3: Alternative Options');
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority',
        });
        console.log('   ✅ SUCCESS!\n');
        await mongoose.connection.close();
        return true;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.message.substring(0, 80)}...\n`);
        return false;
    }
}

async function runTests() {
    const results = [];
    
    results.push(await testConnection1());
    if (!results[0]) {
        results.push(await testConnection2());
    }
    if (!results[0] && !results[1]) {
        results.push(await testConnection3());
    }
    
    console.log('\n📊 RESULTS:');
    if (results.some(r => r)) {
        console.log('✅ At least one connection method worked!');
        console.log('\n💡 Your MongoDB connection is working.');
        console.log('   You can now start your backend server.\n');
    } else {
        console.log('❌ All connection methods failed.');
        console.log('\n🔧 RECOMMENDED FIXES:\n');
        console.log('1. Verify Cluster Status:');
        console.log('   → Go to https://cloud.mongodb.com');
        console.log('   → Check if cluster is "Running" (not paused)\n');
        console.log('2. Get Fresh Connection String:');
        console.log('   → MongoDB Atlas → Clusters → Connect');
        console.log('   → "Connect your application" → Node.js');
        console.log('   → Copy the connection string\n');
        console.log('3. Check IP Whitelist:');
        console.log('   → MongoDB Atlas → Network Access');
        console.log('   → Add IP Address → "Allow from anywhere" (0.0.0.0/0)\n');
        console.log('4. Verify Credentials:');
        console.log('   → Check username/password in connection string');
        console.log('   → URL-encode special characters in password\n');
    }
    
    process.exit(results.some(r => r) ? 0 : 1);
}

runTests().catch(console.error);

