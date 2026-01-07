// MongoDB Connection Test Script
require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection...\n');

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
}

console.log('✅ MONGODB_URI is set');
console.log(`   Format: ${process.env.MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}`);
console.log(`   Connection string starts with: ${process.env.MONGODB_URI.substring(0, 30)}...\n`);

// Test connection
console.log('⏳ Attempting to connect...\n');

mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ SUCCESS! MongoDB Connected');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}\n`);
    
    // Test a simple operation
    console.log('⏳ Testing database operation...');
    return mongoose.connection.db.admin().ping();
})
.then(() => {
    console.log('✅ Database ping successful!\n');
    console.log('🎉 Your MongoDB connection is working correctly!\n');
    mongoose.connection.close();
    process.exit(0);
})
.catch((error) => {
    console.error('\n❌ CONNECTION FAILED!\n');
    console.error('Error details:');
    console.error(`   Message: ${error.message}\n`);
    
    // Provide specific troubleshooting based on error
    if (error.message.includes('authentication failed')) {
        console.error('🔧 TROUBLESHOOTING:');
        console.error('   • Check your username and password in the connection string');
        console.error('   • Make sure special characters in password are URL-encoded');
        console.error('   • Verify database user has correct permissions in MongoDB Atlas\n');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
        console.error('🔧 TROUBLESHOOTING:');
        console.error('   • Check your cluster URL is correct');
        console.error('   • Verify your internet connection');
        console.error('   • Check if MongoDB Atlas cluster is active\n');
    } else if (error.message.includes('timeout') || error.message.includes('buffering')) {
        console.error('🔧 TROUBLESHOOTING:');
        console.error('   • Your IP address might not be whitelisted in MongoDB Atlas');
        console.error('   • Go to MongoDB Atlas → Network Access → Add IP Address');
        console.error('   • Add 0.0.0.0/0 for testing (allows all IPs)');
        console.error('   • Wait 1-2 minutes after adding IP for changes to take effect\n');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.error('🔧 TROUBLESHOOTING:');
        console.error('   • Check your connection string format');
        console.error('   • Verify cluster is not paused in MongoDB Atlas');
        console.error('   • Check network/firewall settings\n');
    }
    
    console.error('📖 See MONGODB_TROUBLESHOOTING.md for detailed help\n');
    mongoose.connection.close();
    process.exit(1);
});

// Handle process interruption
process.on('SIGINT', () => {
    console.log('\n\n⚠️ Connection test interrupted');
    mongoose.connection.close();
    process.exit(1);
});

