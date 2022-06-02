
const formatTransactionData = (data) => {
    //format transaction meta data
    let formattedResponse = {};
    const {
        entity,
        id,
        flags,
        images,
        verifications,
        customer_uid,
        duplicates,
        action,
        fields
    } = data;
    let state = null;
    if (action === 'review') state = 'IN PROGRESS';
    else if(action === 'accept') state = 'COMPLETED';
    else state = 'EXPIRED';
    if (fields && Object.keys(fields).length) {
        const {
            given_name,
            middle_name,
            family_name,
            sex,
            date_of_birth: dateOfBirth,
            age: userAge,
            id_issue_date,
            id_expiry_date,
            id_issuer,
            id_number,
            id_type,
            address_postal_code,
            address_country,
            address_street,
            address_city,
        } = fields;

        // set user data
        // user full name
        const name_array = [];
        if (given_name && given_name.value) name_array.push(given_name.value);
        if (middle_name && middle_name.value) name_array.push(middle_name.value);
        if (family_name && family_name.value) name_array.push(family_name.value);
        const full_name = name_array && name_array.length ? name_array.join(' ') : null;

        // user gender
        let gender = null;
        if (sex && sex.value) gender = sex.value;

        // user date_of_birth
        let date_of_birth = null;
        if (dateOfBirth && dateOfBirth.value) date_of_birth = dateOfBirth.value;

        // user age
        let age = null;
        if (userAge && userAge.value) age = userAge.value;

        // document issued date
        let date_of_issue = null;
        if (id_issue_date && id_issue_date.value) date_of_issue = id_issue_date.value;

        // document expiration_date
        let expiration_date = null;
        if (id_expiry_date && id_expiry_date.value) expiration_date = id_expiry_date.value;

        // document number
        let document_number = null;
        if (id_number && id_number.value) document_number = id_number.value;

        // document type
        let document_type = null;
        if (id_type && id_type.value) document_type = id_type.value;

        // document issuing country
        let issuing_authority = null;
        if (id_issuer && id_issuer.value) issuing_authority = id_issuer.value;

        // address postal code
        let postal_code = null;
        if (address_postal_code && address_postal_code.value) postal_code = address_postal_code.value;

        // address country
        let country = null;
        if (address_country && address_country.value) country = address_country.value;

        // user formatted address
        const address_array = [];
        if (address_street && address_street.value) address_array.push(address_street.value);
        if (address_city && address_city.value) address_array.push(address_city.value);
        if (address_country && address_country.value) address_array.push(address_country.value);
        if (address_postal_code && address_postal_code.value) address_array.push(address_postal_code.value);
        const formatted_address = address_array && address_array.length ? address_array.join(',') : null;

        formattedResponse = {
            entity,
            id,
            flags,
            images: images || {},
            verifications,
            customer_uid,
            duplicates,
            state,
            user: {
                full_name,
                given_names: given_name,
                middle_name,
                family_name,
                gender,
                date_of_birth,
                age,
                date_of_issue,
                expiration_date,
                document_number,
                document_type,
                issuing_authority,
                structured_postal_address: {
                    postal_code,
                    country,
                    formatted_address,
                },
            }
        }
    }

    return formattedResponse;
}

module.exports = {
    formatTransactionData,
}
