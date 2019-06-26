


SELECT CATEGORY, [Sub-CATEGORY], SUM(Sales) AS SALES, SUM(PROFIT) AS PROFIT FROM [dbo].[SampleSuperStore_Orders]
GROUP BY CATEGORY, [Sub-CATEGORY]

SELECT Category,	SubCategory,	Sales,	Profit FROM [dbo].[tabulatorV2]

SELECT Category,	CASE GROUPING(SubCategory) WHEN 1 THEN Category ELSE SubCategory END AS SubCategory,	
    SUM(Sales) AS Sales,	SUM(Profit) AS Profit FROM [dbo].[tabulatorV2] GROUP BY Category,	SubCategory WITH ROLLUP 
ORDER BY Category,	SubCategory


CREATE TABLE tabulatorV3 (Sno INT, Rno INT, node9 NVARCHAR(20),node8 NVARCHAR(20),Category NVARCHAR(20),SubCategory NVARCHAR(20),Sales FLOAT,Profit FLOAT)

--DROP TABLE  [dbo].[tabulatorV3]
SELECT * FROM [dbo].[tabulatorV3] ORDER BY  CATEGORY  ---ORDER BY Rno,  node9 DESC, node8

INSERT INTO [dbo].[tabulatorV3](Rno, node9, CATEGORY, Sales,	Profit)

SELECT  ROW_NUMBER() OVER (ORDER BY Category) AS Rno,  Category, 
		     SUM(Sales) AS Sales, SUM(Profit) As Profit FROM [dbo].[tabulatorV2] GROUP BY Category 


 SELECT Rno, (CAST(Rno AS VARCHAR(2))+'_'+Category) AS node9 , Category, Sales, Profit FROM
 (
		SELECT  ROW_NUMBER() OVER (ORDER BY Category) AS Rno,  Category, 
		     SUM(Sales) AS Sales, SUM(Profit) As Profit FROM [dbo].[tabulatorV2] GROUP BY Category     -----'Parent9' AS node9,
 ) As t1

INSERT INTO [dbo].[tabulatorV3](Rno, node8, CATEGORY, Sales,	Profit)
SELECT ROW_NUMBER() OVER (ORDER BY SubCategory) AS Rno, 
               'Parent8' AS node9, SubCategory, SUM(Sales) AS Sales, SUM(Profit) As Profit FROM [dbo].[tabulatorV2] GROUP BY SubCategory

SELECT * FROM [dbo].[tabulatorV3] ORDER BY  CATEGORY 

-------------------------------------------------------------------------------------------------------------------------
SELECT * FROM tabulatorV4

CREATE TABLE tabulatorV4 (Id INT IDENTITY(1,1), parentID INT, Category NVARCHAR(20),SubCategory NVARCHAR(20),Sales FLOAT,Profit FLOAT)

INSERT INTO tabulatorV4(parentID, Category, Sales, Profit)
SELECT 0 AS parentID, Category, SUM(Sales) AS Sales, SUM(Profit) As Profit FROM [dbo].[tabulatorV2] GROUP BY Category

INSERT INTO tabulatorV4(parentID, Category, Sales, Profit)
SELECT t2.ID AS parentID, t1.SubCategory AS Category, t1.Sales, t1.Profit FROM
(
 ( SELECT  Category, SubCategory, SUM(Sales) AS Sales, SUM(Profit) As Profit FROM [dbo].[tabulatorV2] GROUP BY Category, SubCategory )
) As t1 LEFT JOIN tabulatorV4 t2 ON t1.Category = t2.Category

SELECT * FROM tabulatorV4

---------------------------------------------------------------------------------------------


SELECT * FROM #t1


SELECT Category, SubCategory, Sales, Profit FROM
(
	SELECT Category,	CASE GROUPING(SubCategory) WHEN 1 THEN Category ELSE SubCategory END AS SubCategory,	
		SUM(Sales) AS Sales,	SUM(Profit) AS Profit FROM [dbo].[tabulatorV2] GROUP BY Category,	SubCategory WITH ROLLUP 	 
	--ORDER BY Category,	SubCategory
	) As t 	WHERE Category IS NOT NULL AND SubCategory IS NOT NULL

	----888888888888
	SELECT Category, SubCategory, Container, Sales, Profit FROM
(
	SELECT Category,	CASE GROUPING([Sub-CATEGORY]) WHEN 1 THEN Category ELSE [Sub-CATEGORY] END AS SubCategory,	
	                                CASE GROUPING(Container) WHEN 1 THEN [Sub-CATEGORY] ELSE Container END AS Container,	 
		SUM(Sales) AS Sales,	SUM(Profit) AS Profit FROM #t1 GROUP BY Category,	[Sub-CATEGORY] , Container WITH ROLLUP 	 
	--ORDER BY Category,	SubCategory
	) As t 	WHERE Category IS NOT NULL AND SubCategory IS NOT NULL

	-------------------========================================

	CREATE TABLE tab_InData (Id INT IDENTITY(1,1), parentID INT, Category NVARCHAR(50),SubCategory NVARCHAR(50), Container NVARCHAR(50), Sales FLOAT, Profit FLOAT)


	SELECT * INTO #t1 FROM
	(
		SELECT [Product Category] As Category, [Product Sub-Category] As [SubCategory], [Product Container] As Manufacturer,
			SUM([Quantity ordered new]) AS Quantity, SUM(Sales) AS SALES  FROM [dbo].[SuperStore_Orders]
			GROUP BY [Product Category], [Product Sub-Category],[Product Container]
			--ORDER BY [Product Category], [Product Sub-Category],[Product Container]
	) As t

	drop table #t1
	SELECT * FROM #t1    -------- - --

	INSERT INTO tab_InData(Category,Sales,Profit)
	SELECT CATEGORY, SUM(Sales) AS SALES, SUM(PROFIT) AS PROFIT  FROM #t1 GROUP BY CATEGORY

	SELECT * FROM tab_InData

	SELECT l1.[Sub-CATEGORY] , l1.SALES, l1.PROFIT 
	FROM
	   ( SELECT CATEGORY, [Sub-CATEGORY], SUM(Sales) AS SALES, SUM(PROFIT) AS PROFIT  FROM #t1 GROUP BY [Sub-CATEGORY] 
	   ) As l1 LEFT JOIN ( SELECT Id, CATEGORY FROM tab_InData ) As r1 
	     ON l1.




-----------------------------------------------------------------------------------------------------------------------------------------------------------------
SELECT * FROM tab_InData

CREATE TABLE tab_InData (Id INT IDENTITY(1,1), parentID INT, Category NVARCHAR(50),SubCategory NVARCHAR(50), Container NVARCHAR(50), Sales FLOAT, Profit FLOAT)

--1-----
INSERT INTO tab_InData(Category,Sales,Profit)
	SELECT CATEGORY, SUM(Sales) AS SALES, SUM(PROFIT) AS PROFIT  FROM #t1 GROUP BY CATEGORY

--2-----
INSERT INTO tab_InData(Category,Sales,Profit, parentID)
SELECT  t1.[Sub-CATEGORY] AS Category, t1.Sales, t1.Profit,  t2.ID AS parentID FROM
(
   ( SELECT  Category, [Sub-CATEGORY], SUM(Sales) AS Sales, SUM(Profit) As Profit FROM #t1 GROUP BY Category, [Sub-CATEGORY] )
) As t1 LEFT JOIN tab_InData t2 ON t1.Category = t2.Category

--3-----
INSERT INTO tab_InData(Category,Sales,Profit, parentID)
SELECT  t1.Container AS Category, t1.Sales, t1.Profit,  t2.ID AS parentID FROM
(
   ( SELECT Category,  [Sub-CATEGORY], Container , SUM(Sales) AS Sales, SUM(Profit) As Profit FROM #t1 GROUP BY Category, [Sub-CATEGORY], Container )
) As t1 LEFT JOIN tab_InData t2 ON t1.[Sub-CATEGORY] = t2.Category

	
---------------------------------------------------------------------------------------------------------------------------------------

----------06232019------------------------------------------------------------------------------------------------------------------------------
{"Id":1,"Category":"Furniture","Quantity":8028,"Sales":741999.7952999999},
{"Id":2,"Category":"Office Supplies","Quantity":22906,"Sales":719047.0319999995},
{"Id":3,"Category":"Technology","Quantity":6939,"Sales":836154.0329999999},
{"Id":4,"Category":"Bookcases","parentID":1,"Quantity":868,"Sales":114879.99629999997},
{"Id":5,"Category":"Chairs","parentID":1,"Quantity":2356,"Sales":328449.1029999998},
{"Id":6,"Category":"Furnishings","parentID":1,"Quantity":3563,"Sales":91705.164},
{"Id":7,"Category":"Tables","parentID":1,"Quantity":1241,"Sales":206965.532},
{"Id":8,"Category":"Appliances","parentID":2,"Quantity":1729,"Sales":107532.16099999998},
{"Id":9,"Category":"Art","parentID":2,"Quantity":3000,"Sales":27118.792},
{"Id":10,"Category":"Binders","parentID":2,"Quantity":5974,"Sales":203412.73299999995},
{"Id":11,"Category":"Envelopes","parentID":2,"Quantity":906,"Sales":16476.402000000002},
{"Id":12,"Category":"Fasteners","parentID":2,"Quantity":914,"Sales":3024.2799999999993},
{"Id":13,"Category":"Labels","parentID":2,"Quantity":1400,"Sales":12486.311999999998},
{"Id":14,"Category":"Paper","parentID":2,"Quantity":5178,"Sales":78479.20599999992},
{"Id":15,"Category":"Storage","parentID":2,"Quantity":3158,"Sales":223843.60800000007},
{"Id":16,"Category":"Supplies","parentID":2,"Quantity":647,"Sales":46673.538},
{"Id":17,"Category":"Accessories","parentID":3,"Quantity":2976,"Sales":167380.31800000006},
{"Id":18,"Category":"Copiers","parentID":3,"Quantity":234,"Sales":149528.02999999997},
{"Id":19,"Category":"Machines","parentID":3,"Quantity":440,"Sales":189238.63100000002},
{"Id":20,"Category":"Phones","parentID":3,"Quantity":3289,"Sales":330007.05400000006}

DROP TABLE #tbl_InData
CREATE TABLE #tbl_InData(Id INT, Category NVARCHAR(50), parentID INT,  Quantiry FLOAT, Sales FLOAT)
INSERT INTO 