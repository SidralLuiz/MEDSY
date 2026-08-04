package Conexao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import javax.swing.JComboBox;


public class OperacoesDB {

    

   /* 
    public void SelectCon(int Dia) {
        String sql = "SELECT * FROM Consultas WHERE DIA = ?";
        try (
                //estabeleça a coneção do banco de dados
                Connection conn = ConexaoDB.getConexao();
                //prepara os o comando sql a ser executado
                PreparedStatement stmt = conn.prepareStatement(sql);
                //rs recebe a execução da query
                ResultSet rs = stmt.executeQuery()) {
                stmt.setInt(1,Dia);
           
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    */
    public static class Medico {

    public static String nomeMed;
    public String cpfMed; 
    public String emailMed;
    public String nascMed;
    public String telefoneMed;
    public String enderecoMed;
    public String crm;
    public String especialidade;
    public String senhaMed;


    public Medico(String nomeMed, String cpfMed, String emailMed, String nascMed, 
                  String telefoneMed, String enderecoMed, String crm, String especialidade, String senhaMed) {
    
        this.nomeMed = nomeMed;
        this.cpfMed = cpfMed;
        this.emailMed = emailMed;
        this.nascMed = nascMed;
        this.telefoneMed = telefoneMed;
        this.enderecoMed = enderecoMed;
        this.crm = crm;
        this.especialidade = especialidade;
        this.senhaMed = senhaMed;
    }
    
 
 

    
    public  void insertMed(String nomeMed,String cpfMed, String emailMed,String nascMed,String telefoneMed,String enderecoMed,String crm,String especialidade, String senhaMed) {
        String sql = "INSERT INTO MEDICO (NOMEM,CPFM,EMAILM,NASCM,TELEFONEM,ENDERECOM,CRM,ESPECIALIDADE,SENHAM) VALUES (?,?,?,?,?,?,?,?,?)";
        try (Connection conn = ConexaoDB.getConexao();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

  
            stmt.setString(1, nomeMed);
            stmt.setString(2, cpfMed);
            stmt.setString(3, emailMed);
            stmt.setString(4, nascMed);
            stmt.setString(5, telefoneMed);
            stmt.setString(6, enderecoMed);
            stmt.setString(7, crm);
            stmt.setString(8, especialidade);
            stmt.setString(9, senhaMed);
            
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
      public List<Medico> SelectMed(String cpfMed) {
           
    // A consulta SQL agora contém um parâmetro "?"
    String sql = "SELECT * FROM MEDICO WHERE CPFM = ?";
    List<Medico> selectMed = new ArrayList<>(); // Lista para armazenar os resultados

    try (
        Connection conn = ConexaoDB.getConexao();
       
        PreparedStatement stmt = conn.prepareStatement(sql)
    ) {
        stmt.setString(1, cpfMed);  
        
        // Execute a consulta e receba os resultados
        ResultSet rs = stmt.executeQuery();
        
        // Processar os resultados
        while (rs.next()) {
           
            
            String NOMEM = rs.getString("NOMEM");
            String CPFM = rs.getString("CPFM");
            String EMAILM = rs.getString("EMAILM");
            String NASCM = rs.getString("NASCM");
            String TELEFONEM = rs.getString("TELEFONEM");
            String ENDERECOM = rs.getString("ENDERECOM");
            String CRM = rs.getString("CRM");
            String ESPECIALIDADE = rs.getString("ESPECIALIDADE");
            String SENHAM = rs.getString("SENHAM");
            
           
       Medico mSelect = new Medico(NOMEM, CPFM, EMAILM, NASCM, TELEFONEM,ENDERECOM,CRM,ESPECIALIDADE,SENHAM);
        selectMed.add(mSelect);            //
          

        }
      
        
    }
    catch (SQLException e) {
        e.printStackTrace();
    }
            return selectMed;

    }
     public void deleteMed(String cpfUser){
           String sql = "Delete from MEDICO where CPFM =?";
            try (
            Connection conn = ConexaoDB.getConexao();
            PreparedStatement stmt = conn.prepareStatement(sql)
        ) {
            stmt.setString(1, cpfUser);
             int rowsAffected = stmt.executeUpdate(); 
             System.out.print(rowsAffected);
        } catch (SQLException e) {
            e.printStackTrace();
        }

         }
        public void updateMed(String nomeMed,String cpfMed,String cpfUser,String emailMed,String nascMed,String telefoneMed,String enderecoMed,String crm,String especialidade,String senhaMed){
           String sql = "update  medico set nomem = ?, cpfm = ?, emailm=?, nascm=?, telefonem=?, enderecom=?, crm=?,especialidade=?, senham=? where cpfm =?";
            try (
            Connection conn = ConexaoDB.getConexao();
            PreparedStatement stmt = conn.prepareStatement(sql)
        ) {
            stmt.setString(1, nomeMed);
            stmt.setString(2, cpfMed);
            stmt.setString(3, emailMed);
            stmt.setString(4, nascMed);
            stmt.setString(5, telefoneMed);
            stmt.setString(6, enderecoMed);
            stmt.setString(7, crm);
            stmt.setString(8, especialidade);
            stmt.setString(9, senhaMed);
            stmt.setString(10, cpfUser);
            
            
             int rowsAffected = stmt.executeUpdate(); 
             System.out.print(rowsAffected);
        } catch (SQLException e) {
            e.printStackTrace();
        }

         }
public static boolean veriMed(String cpfUser) {
        String sql = "SELECT 1 FROM MEDICO WHERE CPFM = ?";

        try (
            Connection conn = ConexaoDB.getConexao();
            PreparedStatement stmt = conn.prepareStatement(sql)
        ) {
            stmt.setString(1, cpfUser);
         

            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next(); 
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false; 
    }
    
     public  void insertLogin(String nomeMed,String CPFLogin, String SENHAL,int Numacess) {
        String sql = "INSERT INTO LOGIN (NOMELOGIN,CPFLOGIN, SENHALOGIN,NIVELACESSO) VALUES (?,?,?,?)";
        try (Connection conn = ConexaoDB.getConexao();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            
            stmt.setString(1, nomeMed);
            stmt.setString(2, CPFLogin);
            stmt.setString(3, SENHAL);
            stmt.setInt(4, Numacess);
       
            
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
     }   public  static String getNome() {
        return nomeMed;
    }
    
    public  String getCpf() {
        return cpfMed;
    }
    public String getEmailM(){
        return emailMed;
    }
    public String getnascM(){
        return nascMed;
    }
    public String getTelefoneM(){
        return telefoneMed;
    }
    public String getEnderecoM(){
        return enderecoMed;
    }
    public String getCrm(){
        return crm;
    }
    public String getSenhaM(){
        return senhaMed;
    }
   public String getEspec() {
       return especialidade;
    }

        public Medico get(int i) {
            throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
        }
     

       
    }
      public static class Paciente {

    private String NOMEP;
    private String CPFP; 
    private String EMAILP;
    private String NASCP;
    private String TELEFONEP;
    private String ENDERECOP;

    // Construtor
    public Paciente(String NOMEP, String CPFP, String EMAILP, String NASCP, 
                  String TELEFONEP, String ENDERECOP) {
   
        this.NOMEP = NOMEP;
        this.CPFP = CPFP;
        this.EMAILP = EMAILP;
        this.NASCP = NASCP;
        this.TELEFONEP = TELEFONEP;
        this.ENDERECOP = ENDERECOP;
    }
    public String getCpfP(){
        return CPFP;
    }
    public String getNome(){
        return NOMEP;
    }
    public String getEmailP(){
        return EMAILP;
    }
   public String getNascP(){
       return NASCP;
   }
   public String getTeleP(){
       return TELEFONEP;
   }
   public String getEnderecoP(){
       return ENDERECOP;
   }
    public  void insertPac(String NOMEP,String CPFP, String EMAILP,String NASCP,String TELEFONEP,String ENDERECOP) {
        String sql = "INSERT INTO PACIENTE (NOMEP,CPFP,EMAILP,NASCP,TELEFONEP,ENDERECOP) VALUES (?,?,?,?,?,?)";
        try (Connection conn = ConexaoDB.getConexao();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

  
            stmt.setString(1, NOMEP);
            stmt.setString(2, CPFP);
            stmt.setString(3, EMAILP);
            stmt.setString(4, NASCP);
            stmt.setString(5, TELEFONEP);
            stmt.setString(6, ENDERECOP);
            
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
      public List<Paciente> SelectPac(String CPFP) {
           
    // A consulta SQL agora contém um parâmetro "?"
    String sql = "SELECT * FROM PACIENTE WHERE CPFP = ?";
    List<Paciente> sPac = new ArrayList<>(); // Lista para armazenar os resultados

    try (
        Connection conn = ConexaoDB.getConexao();
       
        PreparedStatement stmt = conn.prepareStatement(sql)
    ) {
        stmt.setString(1, CPFP);  
        
        // Execute a consulta e receba os resultados
        ResultSet rs = stmt.executeQuery();
        
        // Processar os resultados
        while (rs.next()) {
           
            
            String NOMEP = rs.getString("NOMEP");
             CPFP = rs.getString("CPFP");
            String EMAILP = rs.getString("EMAILP");
            String NASCP = rs.getString("NASCP");
            String TELEFONEP = rs.getString("TELEFONEP");
            String ENDERECOP = rs.getString("ENDERECOP");
      
          
            
           
       Paciente selectPac = new Paciente(NOMEP, CPFP, EMAILP, NASCP, TELEFONEP,ENDERECOP);
        sPac.add(selectPac);            //
          

        }
      
        
    }
    catch (SQLException e) {
        e.printStackTrace();
    }
            return sPac;

    } 
    public static boolean veriPac(String cpfUser) {
        String sql = "SELECT 1 FROM PACIENTE WHERE CPFP = ?";

        try (
            Connection conn = ConexaoDB.getConexao();
            PreparedStatement stmt = conn.prepareStatement(sql)
        ) {
            stmt.setString(1, cpfUser);
         

            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next(); 
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false; 
    }
    public void deletePac(String cpfUser){
           String sql = "Delete from PACIENTE where CPFP = ?";
            try (
            Connection conn = ConexaoDB.getConexao();
            PreparedStatement stmt = conn.prepareStatement(sql)
        ) {
            stmt.setString(1, cpfUser);
             int rowsAffected = stmt.executeUpdate(); 
             System.out.print(rowsAffected);
        } catch (SQLException e) {
            e.printStackTrace();
        }

         }
    public void updatePac(String NOMEP,String CPFP, String EMAILP,String NASCP,String TELEFONEP,String ENDERECOP){
           String sql = "update paciente set nomep = ?, cpfp=?, emailp=?, nascp=?,telefonep=?,enderecop=?  where cpfp=?";
            try (
            Connection conn = ConexaoDB.getConexao();
            PreparedStatement stmt = conn.prepareStatement(sql)
        ) {
            stmt.setString(1, NOMEP);
            stmt.setString(2, CPFP);
            stmt.setString(3, EMAILP);
            stmt.setString(4, NASCP);
            stmt.setString(5, TELEFONEP);
            stmt.setString(6, ENDERECOP);
            stmt.setString(7, CPFP);
         
            
            
             int rowsAffected = stmt.executeUpdate(); 
             System.out.print(rowsAffected);
        } catch (SQLException e) {
            e.printStackTrace();
        }

         }

    }
     public static class Secretaria {

    private String NOMES;
    private String CPFSecre; 
    private String EMAILS;
    private String NASCS;
    private String TELEFONEs;
    private String ENDERECOs;
    private String SENHAS;

    // Construtor
    public Secretaria(String NOMES, String CPFSecre, String EMAILS, String NASCS, 
                  String TELEFONEs, String ENDERECOs, String SENHAS) {
   
        this.NOMES = NOMES;
        this.CPFSecre = CPFSecre;
        this.EMAILS = EMAILS;
        this.NASCS = NASCS;
        this.TELEFONEs = TELEFONEs;
        this.ENDERECOs = ENDERECOs;
        this.SENHAS = SENHAS;
      
    }
    public String getNomeS(){
        return NOMES;
    }
    public String getCpfS(){
        return CPFSecre;
    }
    public String getEmailS(){
        return EMAILS;
    }
    public String getNascS(){
        return NASCS;
    }
    public String getTeleS(){
        return TELEFONEs;
    }
    public String getEndeS(){
        return ENDERECOs;
    }
    public String getSenhaS(){
        return SENHAS;
    }
    
    
     public  void insertSec(String NOMES, String CPFSecre, String EMAILS, String NASCS, String TELEFONEs, String ENDERECOP , String SENHAS1) {
        String sql = "INSERT INTO SECRETARIA (NOMES,CPFSecre,EMAILS,NASCS,TELEFONEs,ENDERECOs,SENHAS ) VALUES (?,?,?,?,?,?,?)";
        try (Connection conn = ConexaoDB.getConexao();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

  
            stmt.setString(1, NOMES);
            stmt.setString(2, CPFSecre);
            stmt.setString(3, EMAILS);
            stmt.setString(4, NASCS);
            stmt.setString(5, TELEFONEs);
            stmt.setString(6, ENDERECOs);
            stmt.setString(7, SENHAS);
   

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
     }
        public List<Secretaria> SelectSec(String cpfUser) {
           
    // A consulta SQL agora contém um parâmetro "?"
    String sql = "SELECT * FROM SECRETARIA WHERE CPFSecre = ?";
    List<Secretaria> selectSec = new ArrayList<>(); // Lista para armazenar os resultados

    try (
        Connection conn = ConexaoDB.getConexao();
       
        PreparedStatement stmt = conn.prepareStatement(sql)
    ) {
        stmt.setString(1, cpfUser);  
        
        // Execute a consulta e receba os resultados
        ResultSet rs = stmt.executeQuery();
        
        // Processar os resultados
        while (rs.next()) {
           
            
            String NOMES = rs.getString("NOMES");
            String CPFS = rs.getString("CPFSecre");
            String EMAILS = rs.getString("EMAILS");
            String NASCS = rs.getString("NASCS");
            String TELEFONES = rs.getString("TELEFONEs");
            String ENDERECOS = rs.getString("ENDERECOs");
            String SENHAS = rs.getString("SENHAS");
          
            
           
       Secretaria sSelect = new Secretaria(NOMES, CPFS, EMAILS, NASCS, TELEFONES,ENDERECOS,SENHAS);
        selectSec.add(sSelect);            //
          

        }
      
        
    }
    catch (SQLException e) {
        e.printStackTrace();
    }
            return selectSec;

    }  
                 public static boolean veriSec(String cpfUser) {
        String sql = "SELECT 1 FROM SECRETARIA WHERE CPFSecre = ?";

        try (
            Connection conn = ConexaoDB.getConexao();
            PreparedStatement stmt = conn.prepareStatement(sql)
        ) {
            stmt.setString(1, cpfUser);
         

            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next(); 
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false; 
    }
         public void deleteSec(String cpfUser){
           String sql = "Delete from SECRETARIA where CPFSecre = ?";
            try (
            Connection conn = ConexaoDB.getConexao();
            PreparedStatement stmt = conn.prepareStatement(sql)
        ) {
            stmt.setString(1, cpfUser);
             int rowsAffected = stmt.executeUpdate(); 
             System.out.print(rowsAffected);
        } catch (SQLException e) {
            e.printStackTrace();
        }

         }
        
        
       public  void insertLogin(String NOMES,String CPFLogin, String SENHAL, int Numacess) {
        String sql = "INSERT INTO LOGIN (NOMELOGIN,CPFLOGIN,  SENHALOGIN,NIVELACESSO) VALUES (?,?,?,?)";
        try (Connection conn = ConexaoDB.getConexao();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

             stmt.setString(1, NOMES);
            stmt.setString(2, CPFLogin);
            stmt.setString(3, SENHAL);
             stmt.setInt(4, Numacess);
            
            
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
     }
     }
    public static class Consultas {

    private String PAC;
    private String ESPEC; 
    private String MED;
    private int DIA;
    private String HORARIO;


    // Construtor
    public Consultas(String PAC, String ESPEC, String MED, int DIA, String HORARIO) {
   
        this.PAC = PAC;
        this.ESPEC = ESPEC;
        this.MED = MED;
        this.DIA = DIA;
        this.HORARIO = HORARIO;

    }
      public String getPac() {
        return PAC;
    }

    public String getEspec() {
        return ESPEC;
    }

    public String getMed() {
        return MED;
    }

    public int getDia() {
        return DIA;
    }

    public String getHorario() {
        return HORARIO;
    }
    
   public  void insertCon(String PAC, String ESPEC, String MED, int DIA, String HORARIO) {
        String sql = "INSERT INTO CONSULTAS (PAC,ESPEC,MED,DIA,HORARIO) VALUES (?,?,?,?,?)";
        try (Connection conn = ConexaoDB.getConexao();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

  
            stmt.setString(1, PAC);
            stmt.setString(2, ESPEC);
            stmt.setString(3, MED);
            stmt.setInt(4, DIA);
            stmt.setString(5, HORARIO);

            
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
         
  
    public List<Consultas> SelectCon(int Dia) {
           
    // A consulta SQL agora contém um parâmetro "?"
    String sql = "SELECT * FROM Consultas WHERE DIA = ?";
    List<Consultas> consultasList = new ArrayList<>(); // Lista para armazenar os resultados

    try (
        // Estabeleça a conexão com o banco de dados
        Connection conn = ConexaoDB.getConexao();
        
        // Prepare o comando SQL a ser executado
        PreparedStatement stmt = conn.prepareStatement(sql)
    ) {
        stmt.setInt(1, Dia);  
        
        // Execute a consulta e receba os resultados
        ResultSet rs = stmt.executeQuery();
        
        // Processar os resultados
        while (rs.next()) {
           

            String pac = rs.getString("PAC");
            String espec = rs.getString("ESPEC");
            String med = rs.getString("MED");
            int day = rs.getInt("DIA");
            String horario = rs.getString("HORARIO");
             
            Consultas consultaS = new Consultas(pac, espec, med, day, horario);
                consultasList.add(consultaS);
            //
          

        }
      
        
    }
    catch (SQLException e) {
        e.printStackTrace();
    }
            return consultasList;

    }
    
    

       
       
    }
            public static class Horarios {


      public String MED;
      public int DiaMed;
      public String HORARIO;
      public String ESPECIALIDADE;


      // Construtor
      public Horarios(String MED, int DiaMed, String HORARIO,String ESPECIALIDADE) {


          this.MED = MED;
          this.DiaMed = DiaMed;
          this.HORARIO = HORARIO;
          this.ESPECIALIDADE= ESPECIALIDADE;

      }
      public int getDias(){
          return DiaMed;
      }
      public String getMedH(){
          return MED;
      }
      
      public String getHorarioH(){
          return MED;
      }
      
      public String getEspecH(){
          return MED;
      }
      
      
      

   public  void insertHorario(String MED, int DiaMed, String HORARIO,String ESPECIALIDADE) {
        String sql = "INSERT INTO HORARIOS (nomeMed,Day,horario,especialidadeM) VALUES (?,?,?,?)";
        try (Connection conn = ConexaoDB.getConexao();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

  
          
            stmt.setString(1, MED);
            stmt.setInt(2, DiaMed);
            stmt.setString(3, HORARIO);
            stmt.setString(4, ESPECIALIDADE);

            
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
  
    }
             public void carregarDias(JComboBox<Integer> JcomboMedDia) {
          String sql = "SELECT day FROM horarios";
    try(Connection conn = ConexaoDB.getConexao();
       PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery(sql);)  {
     
   

      
        while (rs.next()) {
            int dia = rs.getInt("day");
            JcomboMedDia.addItem(dia);
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }
    
}
            public static class Login{
               
                private static String nome;
                private static String Cpf;
               private static String Senha;
               private static int nivelAcess;
               
            public Login(String nome,String Cpf,String Senha,int nivelAcess){
                this.Cpf=Cpf;
                this.nome=nome;
                this.Senha=Senha;
                this.nivelAcess=nivelAcess;
                
            }
            public static String  getNomeLog(){
                return nome;
            }
             public static String  getCpfLog(){
                return Cpf;
            }
              public static String  getSenhaLog(){
                return Senha;
            }
               public static int getNivelAcessLog(){
                return nivelAcess;
            }
            public boolean verificarAutenticacao(String Cpf, String Senha) {
                
            List<Consultas> consultasList = new ArrayList<>();
        String sql = "SELECT 1 FROM LOGIN WHERE CPFLOGIN = ? AND SENHALOGIN = ? ";

        try (
            Connection conn = ConexaoDB.getConexao();
            PreparedStatement stmt = conn.prepareStatement(sql)
        ) {
            stmt.setString(1, Cpf);
            stmt.setString(2, Senha);

            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next(); // Retorna verdadeiro se encontrar uma correspondência
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return true; // Retorna falso se ocorrer um erro ou se não houver correspondência
    }
            

           
            
  public static Login selectVeru(String Cpf, String Senha) {
    String sql = "SELECT * FROM LOGIN WHERE CPFLOGIN = ? AND SENHALOGIN = ?";
    Login loginResult = null;

    try (
        // Estabelecendo a conexão com o banco de dados
        Connection conn = ConexaoDB.getConexao();
        // Preparando o comando SQL
        PreparedStatement stmt = conn.prepareStatement(sql)
    ) {
        // Configurando os parâmetros do PreparedStatement
        stmt.setString(1, Cpf);
        stmt.setString(2, Senha);

        // Executando a consulta e obtendo os resultados
        ResultSet rs = stmt.executeQuery();

        // Verificando se há resultados e criando o objeto Login
        if (rs.next()) {
            String nome = rs.getString("NOMELOGIN");
            String senha = rs.getString("SENHALOGIN");
            int nivelAcesso = rs.getInt("NIVELACESSO");

            // Criando o objeto Login com os dados recuperados
            loginResult = new Login(nome, Cpf, senha, nivelAcesso);
        }
    } catch (SQLException e) {
        e.printStackTrace(); // Considere usar um logger para logar erros
    }

    // Retornando o objeto Login (ou null se não encontrar nenhum resultado)
    return loginResult;
}
   public static Login selectAdm(String Cpf, String Senha) {
    String sql = "SELECT * FROM adm WHERE cpfA = ? AND senhaA = ?";
    Login loginResult = null;

    try (
        // Estabelecendo a conexão com o banco de dados
        Connection conn = ConexaoDB.getConexao();
        // Preparando o comando SQL
        PreparedStatement stmt = conn.prepareStatement(sql)
    ) {
        // Configurando os parâmetros do PreparedStatement
        stmt.setString(1, Cpf);
        stmt.setString(2, Senha);

        // Executando a consulta e obtendo os resultados
        ResultSet rs = stmt.executeQuery();

        // Verificando se há resultados e criando o objeto Login
        if (rs.next()) {
            Cpf =rs.getString("cpfA");
            Senha = rs.getString("senhaA");
            String nome = rs.getString("nomeA");
            int acess = rs.getInt("nivelAA");
            

            // Criando o objeto Login com os dados recuperados
            loginResult = new Login(Cpf,Senha,nome,acess);
        }
    } catch (SQLException e) {
        e.printStackTrace(); // Considere usar um logger para logar erros
    }

    // Retornando o objeto Login (ou null se não encontrar nenhum resultado)
    return loginResult;
}  
                  
}
            
}


  

