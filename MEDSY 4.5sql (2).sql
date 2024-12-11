DROP DATABASE MEDSY2;
CREATE DATABASE MEDSY2;
USE MEDSY2;
SELECT * FROM PACIENTE;
DROP TABLE PACIENTE;
CREATE TABLE PACIENTE(
ID_PACIENTE INT PRIMARY KEY AUTO_INCREMENT,
NOMEP VARCHAR(55),
CPFP VARCHAR(35),
EMAILP VARCHAR(35),
NASCP VARCHAR(35),
TELEFONEP VARCHAR(70),
ENDERECOP VARCHAR(35)
);
INSERT INTO PACIENTE VALUES(1,"LUIZ",82815453991,"LFSIDRAL",17,"47991415518","RUA 15 DE AGOSTO","2103");
INSERT INTO PACIENTE VALUES(NULL,"LUIZ",294061357,"maria.silva@email.com",17,"(11) 91234-5678","RUA 15 DE AGOSTO","2103");
INSERT INTO PACIENTE VALUES(NULL,"LUIZA",725380419,"joao123@gmail.com",17,"(21) 99876-5432","RUA 15 DE AGOSTO","2103");
INSERT INTO PACIENTE VALUES(NULL,"LUIZA",725380419,"joao123@gmail.com",17,"(31) 98765-4321","RUA 15 DE AGOSTO","2103");

/*------------------------------------------------------------------------------------------------------------------------------------------*/
DROP TABLE MEDICO;
CREATE TABLE MEDICO(
NOMEM VARCHAR(55),
CPFM VARCHAR(35),
EMAILM VARCHAR(35),
NASCM VARCHAR(35),
TELEFONEM VARCHAR(70),
ENDERECOM VARCHAR(35),
CRM VARCHAR(35),
ESPECIALIDADE VARCHAR(35),
SENHAM VARCHAR(20)
);
INSERT INTO MEDICO VALUES(1,"LUIZ",518926370,"carlos.oliveira@yahoo.com",17,"47991413413123","RUA 16 DE AGOSTO","000000/SP","CARDIOLOGIA","2103");
INSERT INTO MEDICO VALUES(NULL,"LUIZ",518926370,"carlos.oliveira@yahoo.com",17,"47991413413123","RUA 16 DE AGOSTO","000000/SP","CARDIOLOGIA","2103");
SELECT * FROM MEDICO;
/*------------------------------------------------------------------------------------------------------------------------------------------*/
DESCRIBE SECRETARIA;
DROP TABLE SECRETARIA;
CREATE TABLE SECRETARIA(
ID_SECRETARIA INT PRIMARY KEY AUTO_INCREMENT,
NOMES VARCHAR(35),
CPFSecre VARCHAR(35),
EMAILS VARCHAR(35),
NASCS VARCHAR(35),
TELEFONEs VARCHAR(70),
ENDERECOs VARCHAR(35),
SENHAS VARCHAR(15)
);
INSERT INTO SECRETARIA VALUES(null,"LUIZA",058241963,"ana.martins@hotmail.com",87,"47991413413123","RUA 15 DE AGOSTO","2103","Secretaria");
SELECT * FROM SECRETARIA;

/*------------------------------------------------------------------------------------------------------------------------------------------*/
DROP TABLE CONSULTAS;
CREATE TABLE CONSULTAS(
PAC VARCHAR(35),
ESPEC VARCHAR(35),
MED VARCHAR(35),
DIA INT,
HORARIO VARCHAR(35)
);
select * from consultas;
/*------------------------------------------------------------------------------------------------------------------------------------------*/
DROP TABLE LOGIN;
CREATE TABLE LOGIN(
CPFLOGIN varchar(35),
SENHALOGIN VARCHAR(35),
NOMELOGIN varchar(35),	
NIVELACESSO int(15)
);

SELECT * FROM LOGIN;

DROP TABLE HORARIOS;
select * from horarios;
CREATE TABLE HORARIOS(
nomeMed varchar(35),
Day int(15),
horario varchar(35),
especialidadeM varchar(35)
);

DROP TABLE ADM;
CREATE TABLE ADM(
cpfA varchar(35),
senhaA varchar(35),
nomeA varchar(35),
nivelAA int(15)
);
SELECT * FROM ADM;
INSERT INTO ADM VALUES("131","paodequeijo123","luizinhosidral",4);
/*------------------------------------------------------------------------------------------------------------------------------------------*/





/*------------------------------------------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------------------------------------------*/
DROP TRIGGER LOGIN;
DELIMITER $$
CREATE TRIGGER LOGIN AFTER INSERT ON SECRETARIA 
FOR EACH ROW
BEGIN
	INSERT INTO LOGIN (CPFlogin,SENHAlogin) values (CPFSecre.old,SENHAS.old);
END$$
DELIMITER ;