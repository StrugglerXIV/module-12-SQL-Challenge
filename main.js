const inquirer = require('inquirer');
const mysql = require('mysql2');

// Create a connection pool to the MySQL database
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'DeathLight@!3313',
  database: 'company_db',
});

function startApplication() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'option',
        message: 'Choose an option:',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee',
        ],
      },
    ])
    .then((answers) => {
      const { option } = answers;

      switch (option) {
        case 'View all departments':
          viewAllDepartments();
          break;
        case 'View all roles':
          viewAllRoles();
          break;
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee':
          updateEmployeeRole();
          break;
        default:
          console.log('Invalid option');
          break;
      }
    });
}

function viewAllDepartments() {
  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) throw err;
    console.table(results);
    connection.end();
  });
}

function viewAllRoles() {
  connection.query('SELECT * FROM roles', (err, results) => {
    if (err) throw err;
    console.table(results);
    connection.end();
  });
}

function viewAllEmployees() {
    const query = `
      SELECT e.id, e.first_name, e.last_name, r.title AS role, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM employees AS e
      LEFT JOIN roles AS r ON e.role_id = r.id
      LEFT JOIN departments AS d ON r.department_id = d.id
      LEFT JOIN employees AS m ON e.manager_id = m.id
    `;
  
    connection.query(query, (err, results) => {
      if (err) throw err;
  
      console.table(results);
      connection.end();
    });
  }
  

function addDepartment() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: 'Enter the name of the department:',
      },
    ])
    .then((answers) => {
      const { departmentName } = answers;

      connection.query(
        'INSERT INTO departments (name) VALUES (?)',
        [departmentName],
        (err) => {
          if (err) throw err;
          console.log('Department added successfully!');
          connection.end();
        }
      );
    });
}

function addRole() {
    // Fetch existing departments from the database
    connection.query('SELECT id, name FROM departments', (err, results) => {
      if (err) throw err;
  
      const departmentChoices = results.map((department) => ({
        name: department.name,
        value: department.id,
      }));
  
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'title',
            message: 'Enter the title of the new role:',
          },
          {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary of the new role:',
            validate: (input) => {
              const salary = parseInt(input);
              if (isNaN(salary) || salary <= 0) {
                return 'Please enter a valid salary (a positive number).';
              }
              return true;
            },
          },
          {
            type: 'list',
            name: 'departmentId',
            message: 'Choose the department for the new role:',
            choices: departmentChoices,
          },
        ])
        .then((answers) => {
          const { title, salary, departmentId } = answers;
  
          connection.query(
            'INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)',
            [title, salary, departmentId],
            (err) => {
              if (err) throw err;
              console.log('Role added successfully!');
              connection.end();
            }
          );
        });
    });
  }
  

  function addEmployee() {
    // Fetch existing roles from the database
    connection.query('SELECT id, title FROM roles', (err, roleResults) => {
      if (err) throw err;
  
      const roleChoices = roleResults.map((role) => ({
        name: role.title,
        value: role.id,
      }));
  
      // Fetch existing employees (managers) from the database
      connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employees', (err, employeeResults) => {
        if (err) throw err;
  
        const managerChoices = [
          { name: 'None', value: null }, // Option for "None" as manager
          ...employeeResults.map((employee) => ({
            name: employee.name,
            value: employee.id,
          })),
        ];
  
        inquirer
          .prompt([
            {
              type: 'input',
              name: 'firstName',
              message: "Enter the employee's first name:",
            },
            {
              type: 'input',
              name: 'lastName',
              message: "Enter the employee's last name:",
            },
            {
              type: 'list',
              name: 'roleId',
              message: "Choose the employee's role:",
              choices: roleChoices,
            },
            {
              type: 'list',
              name: 'managerId',
              message: "Choose the employee's manager:",
              choices: managerChoices,
            },
          ])
          .then((answers) => {
            const { firstName, lastName, roleId, managerId } = answers;
  
            connection.query(
              'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
              [firstName, lastName, roleId, managerId],
              (err) => {
                if (err) throw err;
                console.log('Employee added successfully!');
                connection.end();
              }
            );
          });
      });
    });
  }
  
  function updateEmployeeRole() {
    // Fetch existing employees from the database
    connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employees', (err, employeeResults) => {
      if (err) throw err;
  
      const employeeChoices = employeeResults.map((employee) => ({
        name: employee.name,
        value: employee.id,
      }));
  
      // Fetch existing roles from the database
      connection.query('SELECT id, title FROM roles', (err, roleResults) => {
        if (err) throw err;
  
        const roleChoices = roleResults.map((role) => ({
          name: role.title,
          value: role.id,
        }));
  
        // Fetch existing departments from the database
        connection.query('SELECT id, name FROM departments', (err, departmentResults) => {
          if (err) throw err;
  
          const departmentChoices = departmentResults.map((department) => ({
            name: department.name,
            value: department.id,
          }));
  
          inquirer
            .prompt([
              {
                type: 'list',
                name: 'employeeId',
                message: 'Select the employee to update:',
                choices: employeeChoices,
              },
              {
                type: 'list',
                name: 'updateField',
                message: 'Select the field to update:',
                choices: ['Role', 'Department', 'Salary', 'Manager'],
              },
              {
                type: 'list',
                name: 'newRole',
                message: 'Select the new role:',
                choices: roleChoices,
                when: (answers) => answers.updateField === 'Role',
              },
              {
                type: 'list',
                name: 'newDepartment',
                message: 'Select the new department:',
                choices: departmentChoices,
                when: (answers) => answers.updateField === 'Department',
              },
              {
                type: 'input',
                name: 'newSalary',
                message: 'Enter the new salary:',
                when: (answers) => answers.updateField === 'Salary',
              },
              {
                type: 'list',
                name: 'newManager',
                message: 'Select the new manager:',
                choices: employeeChoices,
                when: (answers) => answers.updateField === 'Manager',
              },
            ])
            .then((answers) => {
              const { employeeId, updateField, newRole, newDepartment, newSalary, newManager } = answers;
  
              let query;
              let params;
  
              switch (updateField) {
                case 'Role':
                  query = 'UPDATE employees SET role_id = ? WHERE id = ?';
                  params = [newRole, employeeId];
                  break;
                case 'Department':
                  query = 'UPDATE roles SET department_id = ? WHERE id = (SELECT role_id FROM employees WHERE id = ?)';
                  params = [newDepartment, employeeId];
                  break;
                case 'Salary':
                  query = 'UPDATE roles SET salary = ? WHERE id = (SELECT role_id FROM employees WHERE id = ?)';
                  params = [newSalary, employeeId];
                  break;
                case 'Manager':
                  query = 'UPDATE employees SET manager_id = ? WHERE id = ?';
                  params = [newManager, employeeId];
                  break;
              }
  
              connection.query(query, params, (err) => {
                if (err) throw err;
                console.log('Employee role updated successfully!');
                connection.end();
              });
            });
        });
      });
    });
  }
  
  
  startApplication();  