const pool = require('./db');

async function identify(req, res) {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
        return res.status(400).json({ error: 'Email or phone number must be provided' });
    }

    try {
        // 1. Fetch existing contacts
        const existingContactsQuery = `
            SELECT * FROM contacts
            WHERE email = $1 OR phoneNumber = $2
        `;
        const existingContactsResult = await pool.query(existingContactsQuery, [email, phoneNumber]);
        const existingContacts = existingContactsResult.rows;

        let primaryContactId;
        let newContact;

        if (existingContacts.length === 0) {
            // No existing contacts, create a new primary contact
            const createPrimaryContactQuery = `
                INSERT INTO contacts (phoneNumber, email, linkPrecedence, createdAt, updatedAt)
                VALUES ($1, $2, 'primary', NOW(), NOW())
                RETURNING *;
            `;
            const newContactResult = await pool.query(createPrimaryContactQuery, [phoneNumber, email]);
            newContact = newContactResult.rows[0];
            primaryContactId = newContact.id;
        } else {
            // Determine the primary contact from existing contacts
            const primaryContact = existingContacts.find(contact => contact.linkprecedence === 'primary');
            primaryContactId = primaryContact ? primaryContact.id : existingContacts[0].id;

            // Check if the new contact already exists
            const existingContact = existingContacts.find(contact => contact.email === email && contact.phonenumber === phoneNumber);

            if (!existingContact) {
                // Create a new secondary contact linked to the primary contact
                const createSecondaryContactQuery = `
                    INSERT INTO contacts (phoneNumber, email, linkPrecedence, linkedId, createdAt, updatedAt)
                    VALUES ($1, $2, 'secondary', $3, NOW(), NOW())
                    RETURNING *;
                `;
                const newContactResult = await pool.query(createSecondaryContactQuery, [phoneNumber, email, primaryContactId]);
                newContact = newContactResult.rows[0];
            }
        }

        // 3. Consolidate the contact information
        const consolidatedContactQuery = `
            SELECT * FROM contacts
            WHERE id = $1 OR linkedId = $1
        `;
        const consolidatedContactResult = await pool.query(consolidatedContactQuery, [primaryContactId]);
        const consolidatedContacts = consolidatedContactResult.rows;

        const primaryContact = consolidatedContacts.find(contact => contact.linkprecedence === 'primary');
        const secondaryContacts = consolidatedContacts.filter(contact => contact.linkprecedence === 'secondary');

        const emails = [...new Set(consolidatedContacts.map(contact => contact.email))];
        const phoneNumbers = [...new Set(consolidatedContacts.map(contact => contact.phonenumber))];
        const secondaryContactIds = secondaryContacts.map(contact => contact.id);

        const consolidatedContact = {
            primaryContactId: primaryContact.id,
            primaryPhoneNumber: primaryContact.phonenumber,
            emails,
            secondaryPhoneNumbers: secondaryContacts.map(contact => contact.phonenumber),
            secondaryContactIds,
        };

        res.status(200).json(consolidatedContact);
    } catch (error) {
        console.error('Error identifying contact:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { identify };
