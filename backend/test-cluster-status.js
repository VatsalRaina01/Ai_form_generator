// Quick script to help diagnose the DNS error
const https = require('https');

console.log('🔍 Diagnosing MongoDB Atlas Cluster Status...\n');

const clusterName = 'cluster0.cepln95.mongodb.net';
console.log(`Checking cluster: ${clusterName}\n`);

// Test DNS resolution
const dns = require('dns').promises;

async function diagnose() {
    try {
        console.log('1️⃣ Testing DNS resolution...');
        const addresses = await dns.resolve4(clusterName).catch(() => {
            return dns.resolve6(clusterName).catch(() => null);
        });
        
        if (addresses) {
            console.log(`   ✅ DNS resolved: ${addresses[0]}`);
        } else {
            console.log(`   ❌ DNS resolution failed - cannot find cluster`);
        }
    } catch (error) {
        console.log(`   ❌ DNS Error: ${error.message}`);
        console.log(`   💡 This suggests the cluster might be paused or deleted`);
    }

    console.log('\n2️⃣ Checking SRV record...');
    try {
        const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${clusterName}`);
        if (srvRecords && srvRecords.length > 0) {
            console.log(`   ✅ SRV records found: ${srvRecords.length} server(s)`);
            srvRecords.forEach((record, i) => {
                console.log(`      ${i + 1}. ${record.name}:${record.port}`);
            });
        } else {
            console.log(`   ❌ No SRV records found`);
        }
    } catch (error) {
        console.log(`   ❌ SRV resolution failed: ${error.message}`);
        console.log(`   💡 This usually means:`);
        console.log(`      • Cluster is paused in MongoDB Atlas`);
        console.log(`      • Cluster was deleted`);
        console.log(`      • Connection string is incorrect`);
    }

    console.log('\n📋 RECOMMENDATIONS:');
    console.log('   1. Go to https://cloud.mongodb.com');
    console.log('   2. Check if cluster "cluster0.cepln95" exists');
    console.log('   3. Check if cluster status is "Running" (not paused)');
    console.log('   4. Get a fresh connection string from "Connect" button');
    console.log('   5. Update backend/.env with new connection string\n');
}

diagnose().catch(console.error);

