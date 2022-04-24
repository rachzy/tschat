const getRoomTemplate = (roomId) => {
  return (
    "CREATE TABLE `" +
    roomId +
    "` (`messageId` INT NOT NULL UNIQUE, `userId` VARCHAR(45) NOT NULL, `userPfp` VARCHAR(100) NOT NULL, `userColor` ENUM('red', 'blue', 'green', 'yellow', 'white') NOT NULL DEFAULT 'white', `userMessage` TEXT NOT NULL, PRIMARY KEY (`messageId`), UNIQUE INDEX `userId_UNIQUE` (`userId` ASC) VISIBLE);"
  );
};

module.exports = getRoomTemplate;
