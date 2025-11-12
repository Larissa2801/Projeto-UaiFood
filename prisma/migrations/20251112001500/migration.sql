-- Query number 2 from the migration file:
-- 1. Permite temporariamente nulos (NULL)
ALTER TABLE `user` ADD COLUMN `email` VARCHAR(191) NULL; 

-- 2. Atualiza as linhas existentes com valores únicos
UPDATE `user` SET `email` = 'usuario_antigo_1@example.com' WHERE `id` = 1;
UPDATE `user` SET `email` = 'usuario_antigo_2@example.com' WHERE `id` = 2;
-- Adicione um UPDATE para cada linha que você sabe que existe no seu banco.

-- 3. Agora torna a coluna NOT NULL, garantindo o @unique
ALTER TABLE `user` MODIFY COLUMN `email` VARCHAR(191) NOT NULL;