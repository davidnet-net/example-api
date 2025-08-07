ALTER USER 'example'@'%' IDENTIFIED WITH mysql_native_password BY 'example';
GRANT ALL PRIVILEGES ON example.* TO 'example'@'%';
FLUSH PRIVILEGES;