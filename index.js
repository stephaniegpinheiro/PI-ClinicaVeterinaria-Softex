require('dotenv').config()

const express = require('express');
const app = express();
const dbConnection = require('./database/dbConnection');
const port = 3000;

app.use(express.json());

//Rota da API para buscar todos os tutores e animais (internados ou não) da clínica:
app.get('/pets', (req, res) => {
    const sql =
        `SELECT 
    po.owners_CPF AS tutor_id, po.owners_name AS tutor_name, po.owners_contact AS tutor_contact,
    p.pet_id, p.pet_name, p.microchip_code, p.behavior, p.species, p.gender,
    p.age, p.breed, p.weight, p.physical_characteristics, p.allergies, p.diseases,
    v.veterinarian_name AS consultation_veterinarian,
    c.diagnosis, c.referred_hospitalization,
    h.hospitalization_id, h.reason, h.entry_date, h.discharge_date, h.discharge_time, h.requested_exams, h.results_exams,
    h.death, h.time_death, h.date_death, h.hospitalization_observations,
    v_hosp.veterinarian_name AS hospitalization_veterinarian,
    n.nurse_name AS hospitalization_nurse,
    t.treatment_id, t.medication_name, t.medication_period, t.medication_dosage,
    t.medication_interval, t.medication_check, t.administration_route, t.treatment_observations,
    m.monitoring_id, m.mucous_membrane, m.level_consciousness, m.pulse, m.fluid_therapy, m.dehydratation_level, 
    m.rate, m.replacement, m.feeding, m.saturation, m.respiratory_rate, m.emesis,
    m.TPC, m.heart_rate, m.stool_check, m.glucose_check, m.urine_check, m.temperature_check
FROM pets p
JOIN pet_owners po ON p.owners_CPF = po.owners_CPF
LEFT JOIN consultations c ON p.pet_id = c.pet_id
LEFT JOIN veterinarians v ON c.veterinarian_CPF = v.veterinarian_CPF
LEFT JOIN hospitalizations h ON p.pet_id = h.pet_id AND c.referred_hospitalization = TRUE
LEFT JOIN veterinarians v_hosp ON h.veterinarian_CPF = v_hosp.veterinarian_CPF
LEFT JOIN nurses n ON h.hospitalization_id = n.nurse_CPF
LEFT JOIN treatments t ON h.hospitalization_id = t.hospitalization_id
LEFT JOIN monitoring m ON h.hospitalization_id = m.hospitalization_id`;

    dbConnection.query(sql, (err, results) => {
        if (err) {
            console.error('Error searching for registered pets', err);
            return res.status(500).json({ error: 'Internal Server Error.' });
        }
        res.json(results);
    });
});


//Rota da API para buscar somente os animais que estão internados na clínica:
app.get('/pets/hospitalizations', (req, res) => {
    const sql =
        `SELECT 
    p.pet_id, p.pet_name, p.microchip_code, p.behavior, p.species, p.gender, p.age, p.breed, p.weight, 
    p.physical_characteristics, p.allergies, p.diseases,
    po.owners_name AS owner_name, po.owners_contact AS owner_contact,
    h.hospitalization_id, h.reason, h.entry_date, 
    h.requested_exams, h.results_exams, h.hospitalization_observations,
    vet_hosp.veterinarian_name AS veterinarian_hospitalization, 
    nur_hosp.nurse_name AS nurse_hospitalization,
    t.treatment_id, t.medication_name, t.medication_period, t.medication_dosage, 
    t.medication_interval, t.medication_check, t.administration_route, t.treatment_observations,
    vet_treat.veterinarian_name AS veterinarian_treatment, 
    nur_treat.nurse_name AS nurse_treatment,
    m.monitoring_id, m.mucous_membrane, m.level_consciousness, m.pulse, m.fluid_therapy, 
    m.dehydratation_level, m.rate, m.replacement, m.feeding, m.saturation, m.respiratory_rate, 
    m.emesis, m.TPC, m.heart_rate, m.stool_check, m.glucose_check, m.urine_check, m.temperature_check,
    vet_mon.veterinarian_name AS veterinarian_monitoring, 
    nur_mon.nurse_name AS nurse_monitoring
FROM pets p
JOIN pet_owners po ON p.owners_CPF = po.owners_CPF
JOIN hospitalizations h ON p.pet_id = h.pet_id
LEFT JOIN veterinarians vet_hosp ON h.veterinarian_CPF = vet_hosp.veterinarian_CPF
LEFT JOIN nurses nur_hosp ON h.hospitalization_id = nur_hosp.nurse_CPF
LEFT JOIN treatments t ON h.hospitalization_id = t.hospitalization_id
LEFT JOIN veterinarians vet_treat ON t.veterinarian_CPF = vet_treat.veterinarian_CPF
LEFT JOIN nurses nur_treat ON t.nurse_CPF = nur_treat.nurse_CPF
LEFT JOIN monitoring m ON h.hospitalization_id = m.hospitalization_id
LEFT JOIN veterinarians vet_mon ON m.veterinarian_CPF = vet_mon.veterinarian_CPF
LEFT JOIN nurses nur_mon ON m.nurse_CPF = nur_mon.nurse_CPF
WHERE h.discharge_date IS NULL;`

    dbConnection.query(sql, (err, results) => {
        if (err) {
            console.error('Error searching for hospitalized pets', err);
            return res.status(500).json({ error: 'Internal Server Error.' });
        }
        res.json(results);
    });
});


//Rota da API para buscar um animal específico que está internado na clínica:
app.get('/pets/:id/hospitalization', (req, res) => {
    const sql =
        `SELECT 
    p.pet_id, p.pet_name, p.microchip_code, p.behavior, p.species, p.gender, p.age, p.breed, p.weight, 
    p.physical_characteristics, p.allergies, p.diseases,
    po.owners_name AS owner_name, po.owners_contact AS owner_contact,
    h.hospitalization_id, h.reason, h.entry_date, 
    h.requested_exams, h.results_exams, h.hospitalization_observations,
    vet_hosp.veterinarian_name AS veterinarian_hospitalization, 
    nur_hosp.nurse_name AS nurse_hospitalization,
    t.treatment_id, t.medication_name, t.medication_period, t.medication_dosage, 
    t.medication_interval, t.medication_check, t.administration_route, t.treatment_observations,
    vet_treat.veterinarian_name AS veterinarian_treatment, 
    nur_treat.nurse_name AS nurse_treatment,
    m.monitoring_id, m.mucous_membrane, m.level_consciousness, m.pulse, m.fluid_therapy, 
    m.dehydratation_level, m.rate, m.replacement, m.feeding, m.saturation, m.respiratory_rate, 
    m.emesis, m.TPC, m.heart_rate, m.stool_check, m.glucose_check, m.urine_check, m.temperature_check,
    vet_mon.veterinarian_name AS veterinarian_monitoring, 
    nur_mon.nurse_name AS nurse_monitoring
FROM pets p
JOIN pet_owners po ON p.owners_CPF = po.owners_CPF
JOIN hospitalizations h ON p.pet_id = h.pet_id
LEFT JOIN veterinarians vet_hosp ON h.veterinarian_CPF = vet_hosp.veterinarian_CPF
LEFT JOIN nurses nur_hosp ON h.hospitalization_id = nur_hosp.nurse_CPF
LEFT JOIN treatments t ON h.hospitalization_id = t.hospitalization_id
LEFT JOIN veterinarians vet_treat ON t.veterinarian_CPF = vet_treat.veterinarian_CPF
LEFT JOIN nurses nur_treat ON t.nurse_CPF = nur_treat.nurse_CPF
LEFT JOIN monitoring m ON h.hospitalization_id = m.hospitalization_id
LEFT JOIN veterinarians vet_mon ON m.veterinarian_CPF = vet_mon.veterinarian_CPF
LEFT JOIN nurses nur_mon ON m.nurse_CPF = nur_mon.nurse_CPF
WHERE p.pet_id = ? AND h.discharge_date IS NULL;`

    const { id } = req.params;
    dbConnection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error querying pet.', err);
            return res.status(500).json({ error: 'Internal Server Error.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'The pet is not hospitalized.' });
        }
        res.json(results[0]);
    });
});

//Rota da API para cadastrar um novo animal na internação da clínica:
app.post('/pets/hospitalizations/create', (req, res) => {
    const { pet_owners, pets, hospitalizations, treatments, monitoring, veterinarian_CPF, nurse_CPF } = req.body;

        // Início da transação
        dbConnection.beginTransaction(err => {
            if (err) throw err;

            // Inserir o tutor
            const insertOwnerSql =
                `INSERT INTO pet_owners (owners_CPF, owners_name, owners_RG, owners_contact, owners_adress)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            owners_name = VALUES(owners_name), 
            owners_RG = VALUES(owners_RG), 
            owners_contact = VALUES(owners_contact), 
            owners_adress = VALUES(owners_adress)`;

            dbConnection.query(insertOwnerSql, [pet_owners.owner_CPF, pet_owners.owner_name, pet_owners.owner_RG, pet_owners.owner_contact, pet_owners.owner_adress], (err, results) => {
                if (err) {
                    return dbConnection.rollback(() => {
                        res.status(500).json({ error: 'Error inserting owner.' });
                    });
                }

                // Inserir o animal
                const insertPetSql = 
                `INSERT INTO pets (pet_name, microchip_code, behavior, species, gender, age, breed, weight, physical_characteristics, allergies, diseases, owners_CPF)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                dbConnection.query(insertPetSql, [pets.pet_name, pets.microchip_code, pets.behavior, pets.species, pets.gender, pets.age, pets.breed, pets.weight, pets.physical_characteristics, pets.allergies, pets.diseases, pet_owners.owners_CPF], (err, results) => {
                    if (err) {
                        return dbConnection.rollback(() => {
                            res.status(500).json({ error: 'Error inserting pet.' });
                        });
                    }

                    const pet_id = results.insertId; // Obter o ID do pet recém-inserido

                    // Inserir a internação, vinculando a consulta que gerou a internação
                    const insertHospitalizationSql = 
                    `INSERT INTO hospitalizations (reason, entry_date, requested_exams, results_exams, hospitalization_observations, pet_id, consultation_id, veterinarian_CPF)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                    dbConnection.query(insertHospitalizationSql, [hospitalizations.reason, hospitalizations.entry_date, hospitalizations.requested_exams, hospitalizations.results_exams, hospitalizations.hospitalization_observations, pet_id, hospitalizations.consultation_id, veterinarian_CPF], (err, results) => {
                        if (err) {
                            console.error(err);
                            
                            return dbConnection.rollback(() => {
                                res.status(500).json({ error: 'Error inserting hospitalization.' });
                            });
                        }

                        const hospitalization_id = results.insertId; // Obter o ID da internação recém-inserida

                        // Inserir o tratamento
                        const insertTreatmentSql = 
                        `INSERT INTO treatments (medication_name, medication_period, medication_dosage, medication_interval, medication_check, administration_route, treatment_observations, hospitalization_id, veterinarian_CPF, nurse_CPF)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                        dbConnection.query(insertTreatmentSql, [treatments.medication_name, treatments.medication_period, treatments.medication_dosage, treatments.medication_interval, treatments.medication_check, treatments.administration_route, treatments.treatment_observations, hospitalization_id, veterinarian_CPF, nurse_CPF], (err, results) => {
                            if (err) {
                                return dbConnection.rollback(() => {
                                    res.status(500).json({ error: 'Error inserting treatment' });
                                });
                            }

                            // Inserir o monitoramento
                            const insertMonitoringSql = 
                            `INSERT INTO monitoring (mucous_membrane, level_consciousness, pulse, fluid_therapy, dehydratation_level, rate, replacement, feeding, saturation, respiratory_rate, emesis, TPC, heart_rate, stool_check, glucose_check, urine_check, temperature_check, hospitalization_id, veterinarian_CPF, nurse_CPF)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                            dbConnection.query(insertMonitoringSql, [monitoring.mucous_membrane, monitoring.level_consciousness, monitoring.pulse, monitoring.fluid_therapy, monitoring.dehydratation_level, monitoring.rate, monitoring.replacement, monitoring.feeding, monitoring.saturation, monitoring.respiratory_rate, monitoring.emesis, monitoring.TPC, monitoring.heart_rate, monitoring.stool_check, monitoring.glucose_check, monitoring.urine_check, monitoring.temperature_check, hospitalization_id, veterinarian_CPF, nurse_CPF], (err, results) => {
                                if (err) {
                                    return dbConnection.rollback(() => {
                                        res.status(500).json({ error: 'Error inserting monitoring.' });
                                    });
                                }

                                // Se tudo ocorrer bem, o commit da transação é feito:
                                dbConnection.commit(err => {
                                    if (err) {
                                        return dbConnection.rollback(() => {
                                            res.status(500).json({ error: 'Error committing transaction.' });
                                        });
                                    }
                                    res.status(201).json({ message: 'Pet admitted successfully.' });
                                });
                            });
                        });
                    });
                });
            });
        });    
});


//Rota da API para editar os dados de internação de um animal da clínica:
app.put('', (req, res) => {

});


//Rota da API para deletar um animal que está internado na clínica:
app.delete('', (req, res) => {

});

//Conexão com o servidor e com o banco de dados:
app.listen(port, () => {
    dbConnection.connect((err) => {
        if (err) {
            console.error('Error connecting to database:', err.stack);
            return;
        }
        console.log('connected to the database as id', dbConnection.threadId);
    });
    console.log(`Server is running on port: ${port}.`);
});