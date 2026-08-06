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
INSERT INTO PACIENTE VALUES(1,"PACIENTE TESTE UM",11111111111,"paciente1@teste.local",1,"(00) 00000-0001","RUA FICTICIA 100","2103");
INSERT INTO PACIENTE VALUES(NULL,"PACIENTE TESTE DOIS",222222222,"paciente2@teste.local",1,"(00) 00000-0002","RUA FICTICIA 200","2103");
INSERT INTO PACIENTE VALUES(NULL,"PACIENTE TESTE TRES",333333333,"paciente3@teste.local",1,"(00) 00000-0003","RUA FICTICIA 300","2103");
INSERT INTO PACIENTE VALUES(NULL,"PACIENTE TESTE QUATRO",333333333,"paciente4@teste.local",1,"(00) 00000-0004","RUA FICTICIA 400","2103");

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
INSERT INTO MEDICO VALUES(1,"MEDICO TESTE UM",444444444,"medico1@teste.local",1,"(00) 00000-0004","RUA FICTICIA 400","000000/UF","CARDIOLOGIA","2103");
INSERT INTO MEDICO VALUES(NULL,"MEDICO TESTE UM",444444444,"medico1@teste.local",1,"(00) 00000-0004","RUA FICTICIA 400","000000/UF","CARDIOLOGIA","2103");
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
INSERT INTO SECRETARIA VALUES(null,"SECRETARIA TESTE",666666666,"secretaria@teste.local",1,"(00) 00000-0006","RUA FICTICIA 600","2103","Secretaria");
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
INSERT INTO ADM VALUES("131","senhaadmin","adminteste",4);
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